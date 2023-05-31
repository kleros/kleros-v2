// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "../arbitration/IArbitrable.sol";
import "./interfaces/IForeignGateway.sol";

/// Foreign Gateway
/// Counterpart of `HomeGateway`
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

    event ArbitrationCostModified(uint96 indexed _courtID, uint256 _feeForJuror);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.
    uint256 internal localDisputeID = 1; // The disputeID must start from 1 as the KlerosV1 proxy governor depends on this implementation. We now also depend on localDisputeID not ever being zero.
    mapping(uint96 => uint256) public feeForJuror; // feeForJuror[courtID], it mirrors the value on KlerosCore.
    address public governor;
    address public veaOutbox;
    uint256 public immutable senderChainID;
    address public override senderGateway;
    mapping(bytes32 => DisputeData) public disputeHashtoDisputeData;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyFromVea(address _messageSender) {
        require(veaOutbox == msg.sender, "Access not allowed: Fast Bridge only.");
        require(_messageSender == senderGateway, "Access not allowed: Sender Gateway only.");
        _;
    }

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(address _governor, address _veaOutbox, address _senderGateway, uint256 _senderChainID) {
        governor = _governor;
        veaOutbox = _veaOutbox;
        senderGateway = _senderGateway;
        senderChainID = _senderChainID;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /// @dev Changes the governor.
    /// @param _governor The address of the new governor.
    function changeGovernor(address _governor) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        governor = _governor;
    }

    /// @dev Changes the fastBridge, useful to increase the claim deposit.
    /// @param _veaOutbox The address of the new fastBridge.
    function changeVea(address _veaOutbox) external onlyByGovernor {
        veaOutbox = _veaOutbox;
    }

    /// @dev Changes the sender gateway.
    /// @param _senderGateway The address of the new sender gateway.
    function changeReceiverGateway(address _senderGateway) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        senderGateway = _senderGateway;
    }

    /// @dev Changes the `feeForJuror` property value of a specified court.
    /// @param _courtID The ID of the court.
    /// @param _feeForJuror The new value for the `feeForJuror` property value.
    function changeCourtJurorFee(uint96 _courtID, uint256 _feeForJuror) external onlyByGovernor {
        feeForJuror[_courtID] = _feeForJuror;
        emit ArbitrationCostModified(_courtID, _feeForJuror);
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

    function createDisputeERC20(
        uint256 /*_choices*/,
        bytes calldata /*_extraData*/,
        uint256 /*_amount*/
    ) external override returns (uint256 /*disputeID*/) {
        revert("Not supported yet");
    }

    function arbitrationCost(bytes calldata _extraData) public view override returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors) = extraDataToCourtIDMinJurors(_extraData);
        cost = feeForJuror[courtID] * minJurors;
    }

    /// Relay the rule call from the home gateway to the arbitrable.
    function relayRule(
        address _messageSender,
        bytes32 _disputeHash,
        uint256 _ruling,
        address _relayer
    ) external override onlyFromVea(_messageSender) {
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

    function extraDataToCourtIDMinJurors(
        bytes memory _extraData
    ) internal view returns (uint96 courtID, uint256 minJurors) {
        // Note that here we ignore DisputeKitID
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                courtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
            }
            if (feeForJuror[courtID] == 0) courtID = 0;
            if (minJurors == 0) minJurors = MIN_JURORS;
        } else {
            courtID = 0;
            minJurors = MIN_JURORS;
        }
    }
}
