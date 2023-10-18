// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "./interfaces/IForeignGateway.sol";
import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import "../libraries/Constants.sol";

/// Foreign Gateway
/// Counterpart of `HomeGateway`
contract ForeignGateway is IForeignGateway, UUPSProxiable, Initializable {
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

    event ArbitrationCostModified(uint96 indexed _courtID, uint256 _feeForJuror);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 internal localDisputeID; // The disputeID must start from 1 as the KlerosV1 proxy governor depends on this implementation. We now also depend on localDisputeID not ever being zero.
    mapping(uint96 => uint256) public feeForJuror; // feeForJuror[v2CourtID], it mirrors the value on KlerosCore.
    address public governor;
    address public veaOutbox;
    uint256 public override homeChainID;
    address public override homeGateway;
    address public deprecatedVeaOutbox;
    uint256 public deprecatedVeaOutboxExpiration;
    mapping(bytes32 => DisputeData) public disputeHashtoDisputeData;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyFromVea(address _messageSender) {
        require(
            veaOutbox == msg.sender ||
                (block.timestamp < deprecatedVeaOutboxExpiration && deprecatedVeaOutbox == msg.sender),
            "Access not allowed: Vea Outbox only."
        );
        require(_messageSender == homeGateway, "Access not allowed: HomeGateway only.");
        _;
    }

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Constructs the `PolicyRegistry` contract.
    /// @param _governor The governor's address.
    /// @param _veaOutbox The address of the VeaOutbox.
    /// @param _homeChainID The chainID of the home chain.
    /// @param _homeGateway The address of the home gateway.
    function initialize(
        address _governor,
        address _veaOutbox,
        uint256 _homeChainID,
        address _homeGateway
    ) external reinitializer(1) {
        governor = _governor;
        veaOutbox = _veaOutbox;
        homeChainID = _homeChainID;
        homeGateway = _homeGateway;
        localDisputeID = 1;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the governor can perform upgrades (`onlyByGovernor`)
     */
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the governor.
    /// @param _governor The address of the new governor.
    function changeGovernor(address _governor) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        governor = _governor;
    }

    /// @dev Changes the outbox.
    /// @param _veaOutbox The address of the new outbox.
    /// @param _gracePeriod The duration to accept messages from the deprecated bridge (if at all).
    function changeVea(address _veaOutbox, uint256 _gracePeriod) external onlyByGovernor {
        // grace period to relay the remaining messages which are still going through the deprecated bridge.
        deprecatedVeaOutboxExpiration = block.timestamp + _gracePeriod;
        deprecatedVeaOutbox = veaOutbox;
        veaOutbox = _veaOutbox;
    }

    /// @dev Changes the home gateway.
    /// @param _homeGateway The address of the new home gateway.
    function changeHomeGateway(address _homeGateway) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        homeGateway = _homeGateway;
    }

    /// @dev Changes the `feeForJuror` property value of a specified court.
    /// @param _courtID The ID of the court on the v2 arbitrator. Not to be confused with the courtID on KlerosLiquid.
    /// @param _feeForJuror The new value for the `feeForJuror` property value.
    function changeCourtJurorFee(uint96 _courtID, uint256 _feeForJuror) external onlyByGovernor {
        feeForJuror[_courtID] = _feeForJuror;
        emit ArbitrationCostModified(_courtID, _feeForJuror);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc IArbitratorV2
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
                "createDispute",
                blockhash(block.number - 1),
                chainID,
                msg.sender,
                disputeID,
                _choices,
                _extraData
            )
        );

        disputeHashtoDisputeData[disputeHash] = DisputeData({
            id: uint248(disputeID),
            arbitrable: msg.sender,
            paid: msg.value,
            relayer: address(0),
            ruled: false
        });

        emit CrossChainDisputeOutgoing(blockhash(block.number - 1), msg.sender, disputeID, _choices, _extraData);
    }

    /// @inheritdoc IArbitratorV2
    function createDispute(
        uint256 /*_choices*/,
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/,
        uint256 /*_feeAmount*/
    ) external pure override returns (uint256) {
        revert("Not supported");
    }

    /// @inheritdoc IArbitratorV2
    function arbitrationCost(bytes calldata _extraData) public view override returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors) = extraDataToCourtIDMinJurors(_extraData);
        cost = feeForJuror[courtID] * minJurors;
    }

    /// @inheritdoc IArbitratorV2
    function arbitrationCost(
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/
    ) public pure override returns (uint256 /*cost*/) {
        revert("Not supported");
    }

    /// @inheritdoc IForeignGateway
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

        IArbitrableV2 arbitrable = IArbitrableV2(dispute.arbitrable);
        arbitrable.rule(dispute.id, _ruling);
    }

    /// @inheritdoc IForeignGateway
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

    /// @inheritdoc IForeignGateway
    function disputeHashToForeignID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
    }

    /// @inheritdoc IReceiverGateway
    function senderGateway() external view override returns (address) {
        return homeGateway;
    }

    function currentRuling(
        uint256 /*_disputeID*/
    ) public pure returns (uint256 /*ruling*/, bool /*tied*/, bool /*overridden*/) {
        revert("Not supported");
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
            if (minJurors == 0) minJurors = Constants.DEFAULT_NB_OF_JURORS;
        } else {
            courtID = 0;
            minJurors = Constants.DEFAULT_NB_OF_JURORS;
        }
    }
}
