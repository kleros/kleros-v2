// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere, @shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrable.sol";
import "./interfaces/IForeignGateway.sol";

/**
 * Foreign Gateway
 * Counterpart of `HomeGateway`
 */
contract ForeignGateway is IForeignGateway {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DisputeData {
        uint248 id;
        bool ruled;
        address arbitrable;
        uint256 paid;
        address relayer;
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event OutgoingDispute(
        bytes32 disputeHash,
        bytes32 blockhash,
        uint256 localDisputeID,
        uint256 _choices,
        bytes _extraData,
        address arbitrable
    );

    event ArbitrationCostModified(uint96 indexed _subcourtID, uint256 _feeForJuror);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.
    uint256 public immutable override senderChainID;
    address public immutable override senderGateway;
    uint256 internal localDisputeID = 1; // The disputeID must start from 1 as the KlerosV1 proxy governor depends on this implementation. We now also depend on localDisputeID not ever being zero.
    mapping(uint96 => uint256) public feeForJuror; // feeForJuror[subcourtID], it mirrors the value on KlerosCore.
    address public governor;
    IFastBridgeReceiver public fastBridgeReceiver;
    IFastBridgeReceiver public depreciatedFastbridge;
    uint256 public depreciatedFastBridgeExpiration;
    mapping(bytes32 => DisputeData) public disputeHashtoDisputeData;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyFromFastBridge() {
        require(
            address(fastBridgeReceiver) == msg.sender ||
                ((block.timestamp < depreciatedFastBridgeExpiration) && address(depreciatedFastbridge) == msg.sender),
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
        IFastBridgeReceiver _fastBridgeReceiver,
        address _senderGateway,
        uint256 _senderChainID
    ) {
        governor = _governor;
        fastBridgeReceiver = _fastBridgeReceiver;
        senderGateway = _senderGateway;
        senderChainID = _senderChainID;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /**
     * @dev Changes the fastBridge, useful to increase the claim deposit.
     * @param _fastBridgeReceiver The address of the new fastBridge.
     * @param _gracePeriod The duration to accept messages from the deprecated bridge (if at all).
     */
    function changeFastbridge(IFastBridgeReceiver _fastBridgeReceiver, uint256 _gracePeriod) external onlyByGovernor {
        // grace period to relay remaining messages in the relay / bridging process
        depreciatedFastBridgeExpiration = block.timestamp + _fastBridgeReceiver.epochPeriod() + _gracePeriod; // 2 weeks
        depreciatedFastbridge = fastBridgeReceiver;
        fastBridgeReceiver = _fastBridgeReceiver;
    }

    /**
     * @dev Changes the `feeForJuror` property value of a specified subcourt.
     * @param _subcourtID The ID of the subcourt.
     * @param _feeForJuror The new value for the `feeForJuror` property value.
     */
    function changeSubcourtJurorFee(uint96 _subcourtID, uint256 _feeForJuror) external onlyByGovernor {
        feeForJuror[_subcourtID] = _feeForJuror;
        emit ArbitrationCostModified(_subcourtID, _feeForJuror);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function createDispute(
        uint256 _choices,
        bytes calldata _extraData
    ) external payable override returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Not paid enough for arbitration");

        disputeID = localDisputeID++;
        uint256 chainID;
        assembly {
            chainID := chainid()
        }
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

    function arbitrationCost(bytes calldata _extraData) public view override returns (uint256 cost) {
        (uint96 subcourtID, uint256 minJurors) = extraDataToSubcourtIDMinJurors(_extraData);
        cost = feeForJuror[subcourtID] * minJurors;
    }

    /**
     * Relay the rule call from the home gateway to the arbitrable.
     */
    function relayRule(
        address _messageSender,
        bytes32 _disputeHash,
        uint256 _ruling,
        address _relayer
    ) external override onlyFromFastBridge {
        require(_messageSender == senderGateway, "Only the homegateway is allowed.");
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];

        require(dispute.id != 0, "Dispute does not exist");
        require(!dispute.ruled, "Cannot rule twice");

        dispute.ruled = true;
        dispute.relayer = _relayer;

        IArbitrable arbitrable = IArbitrable(dispute.arbitrable);
        arbitrable.rule(dispute.id, _ruling);
    }

    function withdrawFees(bytes32 _disputeHash) external override {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];
        require(dispute.id != 0, "Dispute does not exist");
        require(dispute.ruled, "Not ruled yet");

        uint256 amount = dispute.paid;
        dispute.paid = 0;
        payable(dispute.relayer).transfer(amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function disputeHashToForeignID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
    }

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function extraDataToSubcourtIDMinJurors(
        bytes memory _extraData
    ) internal view returns (uint96 subcourtID, uint256 minJurors) {
        // Note that here we ignore DisputeKitID
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                subcourtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
            }
            if (feeForJuror[subcourtID] == 0) subcourtID = 0;
            if (minJurors == 0) minJurors = MIN_JURORS;
        } else {
            subcourtID = 0;
            minJurors = MIN_JURORS;
        }
    }
}
