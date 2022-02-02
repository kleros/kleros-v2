// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrable.sol";
import "../bridge/IL1Bridge.sol";

import "./interfaces/IHomeGateway.sol";
import "./interfaces/IForeignGateway.sol";

abstract contract BaseForeignGateway is IL1Bridge, IForeignGateway {
    // The global default minimum number of jurors in a dispute.
    uint256 public constant MIN_JURORS = 3;

    // @dev Note the disputeID needs to start from one as
    // the KlerosV1 proxy governor depends on this implementation.
    uint256 internal localDisputeID = 1;

    // feeForJuror by subcourtID
    uint256[] internal feeForJuror;

    struct DisputeData {
        uint248 id;
        bool ruled;
        address arbitrable;
        uint256 paid;
        address forwarder;
    }
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => DisputeData) public disputeHashtoDisputeData;

    IHomeGateway public homeGateway;
    uint256 public chainID;
    address public governor;

    modifier onlyFromL2() {
        onlyCrossChainSender();
        _;
    }

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(
        address _governor,
        IHomeGateway _homeGateway,
        uint256[] memory _feeForJuror
    ) {
        governor = _governor;
        homeGateway = _homeGateway;
        feeForJuror = _feeForJuror;

        uint256 id;
        assembly {
            id := chainid()
        }
        chainID = id;
    }

    /** @dev Changes the `feeForJuror` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _feeForJuror The new value for the `feeForJuror` property value.
     */
    function changeSubcourtJurorFee(uint96 _subcourtID, uint256 _feeForJuror) external onlyByGovernor {
        feeForJuror[_subcourtID] = _feeForJuror;
    }

    function createDispute(uint256 _choices, bytes calldata _extraData) external payable returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Not paid enough for arbitration");

        (uint96 subcourtID, ) = extraDataToSubcourtIDMinJurors(_extraData);
        uint256 nbVotes = msg.value / feeForJuror[subcourtID];

        disputeID = localDisputeID++;
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                chainID,
                blockhash(block.number - 1),
                "createDispute",
                disputeID,
                arbitrationCost(_extraData),
                _choices,
                _extraData,
                msg.sender
            )
        );
        disputeIDtoHash[disputeID] = disputeHash;

        disputeHashtoDisputeData[disputeHash] = DisputeData({
            id: uint248(disputeID),
            arbitrable: msg.sender,
            paid: msg.value,
            forwarder: address(0),
            ruled: false
        });

        bytes4 methodSelector = IHomeGateway.handleIncomingDispute.selector;
        bytes memory data = abi.encodeWithSelector(
            methodSelector,
            disputeHash,
            _choices,
            _extraData,
            nbVotes * feeForJuror[subcourtID] // we calculate the min amount required for nbVotes
        );

        // We only pay for the submissionPrice gas cost
        // which is minimum gas cost required for submitting a
        // arbitrum retryable ticket to the retry buffer for
        // bridge to L2.
        // For immediate inclusion a user/bot needs to pay (GasPrice x MaxGas)
        // with the associated ticketId that is emitted by this function
        // after the ticket is successfully submitted.
        // For more details, see:
        // https://developer.offchainlabs.com/docs/l1_l2_messages#retryable-tickets-contract-api
        //
        // We do NOT forward the arbitrationCost ETH funds to the HomeGateway yet,
        // only the calldata.
        sendCrossDomainMessage(data, 0, 0);

        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    function arbitrationCost(bytes calldata _extraData) public view returns (uint256 cost) {
        (uint96 subcourtID, uint256 minJurors) = extraDataToSubcourtIDMinJurors(_extraData);

        // Calculate the size of calldata that will be passed to the L2 bridge
        // as that is a factor for the bridging cost.
        // Calldata size of handleIncomingDispute:
        // methodId + bytes32 disputeHash + uint256 _choices + bytes _extraData + uint256 _arbitrationCost)
        //    4     +   32                +   32             + dynamic          +  32
        uint256 calldatasize = 100 + _extraData.length;

        uint256 bridgeCost = bridgingCost(calldatasize);
        uint256 arbCost = feeForJuror[subcourtID] * minJurors;

        return bridgeCost + arbCost;
    }

    /**
     * Relay the rule call from the home gateway to the arbitrable.
     */
    function relayRule(
        bytes32 _disputeHash,
        uint256 _ruling,
        address _forwarder
    ) external onlyFromL2 {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];

        require(!dispute.ruled, "Cannot rule twice");
        dispute.ruled = true;
        dispute.forwarder = _forwarder;

        IArbitrable arbitrable = IArbitrable(dispute.arbitrable);
        arbitrable.rule(dispute.id, _ruling);
    }

    function withdrawFees(bytes32 _disputeHash) external {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];
        require(dispute.ruled, "Not ruled yet");

        uint256 amount = dispute.paid;
        dispute.paid = 0;
        payable(dispute.forwarder).transfer(amount);
    }

    function foreignDisputeHashToID(bytes32 _disputeHash) external view returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
    }

    function disputeID(uint256 _foreignDisputeID) external view returns (uint256) {
        bytes32 disputeHash = disputeIDtoHash[_foreignDisputeID];
        require(disputeHash != 0, "Dispute does not exist");

        return homeGateway.homeDisputeHashToID(disputeHash);
    }

    function homeChainID(uint256 _disputeID) external view returns (uint256) {
        return homeGateway.chainID();
    }

    function homeBridge(uint256 _disputeID) external view returns (address) {
        return address(homeGateway);
    }

    function extraDataToSubcourtIDMinJurors(bytes memory _extraData)
        internal
        view
        returns (uint96 subcourtID, uint256 minJurors)
    {
        // Note that here we ignore DisputeKitID
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                subcourtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
            }
            if (subcourtID >= feeForJuror.length) subcourtID = 0;
            if (minJurors == 0) minJurors = MIN_JURORS;
        } else {
            subcourtID = 0;
            minJurors = MIN_JURORS;
        }
    }
}
