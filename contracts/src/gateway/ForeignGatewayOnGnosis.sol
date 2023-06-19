// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz, @unknownunknown1]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "../arbitration/IArbitrableV2.sol";
import "./interfaces/IForeignGateway.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// Foreign Gateway
/// Counterpart of `HomeGateway`
contract ForeignGatewayOnGnosis is IForeignGateway {
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

    uint256 public constant DEFAULT_NB_OF_JURORS = 3; // The default number of jurors in a dispute.
    IERC20 public immutable weth; // WETH token on xDai.
    uint256 internal localDisputeID = 1; // The disputeID must start from 1 as the KlerosV1 proxy governor depends on this implementation. We now also depend on localDisputeID not ever being zero.
    mapping(uint96 => uint256) public feeForJuror; // feeForJuror[v2CourtID], it mirrors the value on KlerosCore.
    address public governor;
    address public veaOutbox;
    uint256 public immutable senderChainID;
    address public override senderGateway;
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
        require(_messageSender == senderGateway, "Access not allowed: Sender Gateway only.");
        _;
    }

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(address _governor, address _veaOutbox, address _senderGateway, uint256 _senderChainID, IERC20 _weth) {
        governor = _governor;
        veaOutbox = _veaOutbox;
        senderGateway = _senderGateway;
        senderChainID = _senderChainID;
        weth = _weth;
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

    /// @dev Changes the outbox.
    /// @param _veaOutbox The address of the new outbox.
    /// @param _gracePeriod The duration to accept messages from the deprecated bridge (if at all).
    function changeVea(address _veaOutbox, uint256 _gracePeriod) external onlyByGovernor {
        // grace period to relay the remaining messages which are still going through the deprecated bridge.
        deprecatedVeaOutboxExpiration = block.timestamp + _gracePeriod;
        deprecatedVeaOutbox = veaOutbox;
        veaOutbox = _veaOutbox;
    }

    /// @dev Changes the sender gateway.
    /// @param _senderGateway The address of the new sender gateway.
    function changeReceiverGateway(address _senderGateway) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        senderGateway = _senderGateway;
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

    function createDispute(
        uint256 /*_choices*/,
        bytes calldata /*_extraData*/
    ) external payable override returns (uint256 disputeID) {
        revert("Fees should be paid in WETH");
    }

    function createDisputeERC20(
        uint256 _choices,
        bytes calldata _extraData,
        uint256 _amount
    ) external override returns (uint256 disputeID) {
        // This check is duplicated in xKlerosLiquid and transferred is done there as well.
        require(_amount >= arbitrationCost(_extraData), "Not paid enough for arbitration");

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
            paid: _amount,
            relayer: address(0),
            ruled: false
        });

        emit CrossChainDisputeOutgoing(blockhash(block.number - 1), msg.sender, disputeID, _choices, _extraData);
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

        IArbitrableV2 arbitrable = IArbitrableV2(dispute.arbitrable);
        arbitrable.rule(dispute.id, _ruling);
    }

    function withdrawFees(bytes32 _disputeHash) external override {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];
        require(dispute.id != 0, "Dispute does not exist");
        require(dispute.ruled, "Not ruled yet");

        uint256 amount = dispute.paid;
        dispute.paid = 0;
        weth.transfer(dispute.relayer, amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function disputeHashToForeignID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
    }

    function currentRuling(uint _disputeID) external view returns (uint ruling) {
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
            if (minJurors == 0) minJurors = DEFAULT_NB_OF_JURORS;
        } else {
            courtID = 0;
            minJurors = DEFAULT_NB_OF_JURORS;
        }
    }
}
