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
import "../bridge/interfaces/IFastBridgeReceiver.sol";

import "./interfaces/IForeignGateway.sol";

contract ForeignGateway is IForeignGateway {
    // The global default minimum number of jurors in a dispute.
    uint256 public constant MIN_JURORS = 3;

    // @dev Note the disputeID needs to start from one as
    // the KlerosV1 proxy governor depends on this implementation.
    // We now also depend on localDisputeID not being zero
    // at any point.
    uint256 internal localDisputeID = 1;

    // feeForJuror by subcourtID
    uint256[] internal feeForJuror;
    uint256 public chainID;
    uint256 public homeChainID;

    struct DisputeData {
        uint248 id;
        bool ruled;
        address arbitrable;
        uint256 paid;
        address relayer;
    }
    mapping(bytes32 => DisputeData) public disputeHashtoDisputeData;

    address public governor;
    IFastBridgeReceiver public fastbridge;
    address public homeGateway;

    event DisputeHash(
        bytes32 disputeHash,
        bytes32 blockhash,
        uint256 localDisputeID,
        uint256 _choices,
        bytes _extraData,
        address arbitrable
    );

    modifier onlyFromFastBridge() {
        require(address(fastbridge) == msg.sender, "Access not allowed: Fast Bridge only.");
        _;
    }

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(
        address _governor,
        IFastBridgeReceiver _fastbridge,
        uint256[] memory _feeForJuror,
        address _homeGateway,
        uint256 _homeChainID
    ) {
        governor = _governor;
        fastbridge = _fastbridge;
        feeForJuror = _feeForJuror;
        homeGateway = _homeGateway;
        homeChainID = _homeChainID;

        assembly {
            sstore(chainID.slot, chainid())
        }
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
                _choices,
                _extraData,
                msg.sender
                // TODO: actual arbitration Cost
                // nbVotes * feeForJuror[subcourtID] // we calculate the min amount required for nbVotes
            )
        );

        disputeHashtoDisputeData[disputeHash] = DisputeData({
            id: uint248(disputeID),
            arbitrable: msg.sender,
            paid: msg.value,
            relayer: address(0),
            ruled: false
        });

        emit DisputeHash(disputeHash, blockhash(block.number - 1), disputeID, _choices, _extraData, msg.sender);
        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    function arbitrationCost(bytes calldata _extraData) public view returns (uint256 cost) {
        (uint96 subcourtID, uint256 minJurors) = extraDataToSubcourtIDMinJurors(_extraData);

        cost = feeForJuror[subcourtID] * minJurors;
    }

    /**
     * Relay the rule call from the home gateway to the arbitrable.
     */
    function relayRule(
        bytes32 _disputeHash,
        uint256 _ruling,
        address _relayer
    ) external onlyFromFastBridge {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];

        require(dispute.id != 0, "Dispute does not exist");
        require(!dispute.ruled, "Cannot rule twice");

        dispute.ruled = true;
        dispute.relayer = _relayer;

        IArbitrable arbitrable = IArbitrable(dispute.arbitrable);
        arbitrable.rule(dispute.id, _ruling);
    }

    function withdrawFees(bytes32 _disputeHash) external {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];
        require(dispute.id != 0, "Dispute does not exist");
        require(dispute.ruled, "Not ruled yet");

        uint256 amount = dispute.paid;
        dispute.paid = 0;
        payable(dispute.relayer).transfer(amount);
    }

    function disputeHashToForeignID(bytes32 _disputeHash) external view returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
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
