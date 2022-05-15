// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz, @jaybuidl]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrable.sol";
import "../bridge/interfaces/IFastBridgeReceiver.sol";

import "./interfaces/IForeignGateway.sol";

/**
 * Foreign Gateway on Ethereum
 * Counterpart of `HomeGatewayToEthereum`
 */
contract ForeignGatewayOnEthereum is IForeignGateway {
    // The global default minimum number of jurors in a dispute.
    uint256 public constant MIN_JURORS = 3;

    // @dev Note the disputeID needs to start from one as
    // the KlerosV1 proxy governor depends on this implementation.
    // We now also depend on localDisputeID not being zero
    // at any point.
    uint256 internal localDisputeID = 1;

    // feeForJuror by subcourtID
    uint256[] internal feeForJuror;
    uint256 public immutable chainID;
    uint256 public immutable homeChainID;

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
    IFastBridgeReceiver public depreciatedFastbridge;
    uint256 fastbridgeExpiration;
    address public homeGateway;

    event OutgoingDispute(
        bytes32 disputeHash,
        bytes32 blockhash,
        uint256 localDisputeID,
        uint256 _choices,
        bytes _extraData,
        address arbitrable
    );

    modifier onlyFromFastBridge() {
        require(
            address(fastbridge) == msg.sender ||
                ((block.timestamp < fastbridgeExpiration) && address(depreciatedFastbridge) == msg.sender),
            "Access not allowed: Fast Bridge only."
        );
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
        uint256 _homeChainID,
        uint256 _chainID
    ) {
        governor = _governor;
        fastbridge = _fastbridge;
        feeForJuror = _feeForJuror;
        homeGateway = _homeGateway;
        homeChainID = _homeChainID;
        chainID = _chainID;
    }

    /** @dev Changes the fastBridge, useful to increase the claim deposit.
     *  @param _fastbridge The address of the new fastBridge.
     */
    function changeFastbridge(IFastBridgeReceiver _fastbridge) external onlyByGovernor {
        // grace period to relay remaining messages in the relay / bridging process
        fastbridgeExpiration = block.timestamp + _fastbridge.epochPeriod() + 1209600; // 2 weeks
        depreciatedFastbridge = fastbridge;
        fastbridge = _fastbridge;
    }

    /** @dev Changes the `feeForJuror` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _feeForJuror The new value for the `feeForJuror` property value.
     */
    function changeSubcourtJurorFee(uint96 _subcourtID, uint256 _feeForJuror) external onlyByGovernor {
        feeForJuror[_subcourtID] = _feeForJuror;
    }

    /** @dev Creates the `feeForJuror` property value for a new subcourt.
     *  @param _feeForJuror The new value for the `feeForJuror` property value.
     */
    function createSubcourtJurorFee(uint256 _feeForJuror) external onlyByGovernor {
        feeForJuror.push(_feeForJuror);
    }

    function createDispute(uint256 _choices, bytes calldata _extraData) external payable returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Not paid enough for arbitration");

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
            )
        );

        disputeHashtoDisputeData[disputeHash] = DisputeData({
            id: uint248(disputeID),
            arbitrable: msg.sender,
            paid: msg.value,
            relayer: address(0),
            ruled: false
        });

        emit OutgoingDispute(disputeHash, blockhash(block.number - 1), disputeID, _choices, _extraData, msg.sender);
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
        address _messageOrigin,
        bytes32 _disputeHash,
        uint256 _ruling,
        address _relayer
    ) external onlyFromFastBridge {
        require(_messageOrigin == homeGateway, "Only the homegateway is allowed.");
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
