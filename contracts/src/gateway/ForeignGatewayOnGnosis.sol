// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere, @shalzz, @unknownunknown1]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrable.sol";
import "./interfaces/IForeignGateway.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * Foreign Gateway
 * Counterpart of `HomeGateway`
 */
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

    event OutgoingDispute(
        bytes32 disputeHash,
        bytes32 blockhash,
        uint256 localDisputeID,
        uint256 _choices,
        bytes _extraData,
        address arbitrable
    );

    event ArbitrationCostModified(
        uint96 indexed _courtID,
        uint256 _feeForJuror
    );

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.
    IERC20 public immutable weth; // WETH token on xDai.
    uint256 internal localDisputeID = 1; // The disputeID must start from 1 as the KlerosV1 proxy governor depends on this implementation. We now also depend on localDisputeID not ever being zero.
    mapping(uint96 => uint256) public feeForJuror; // feeForJuror[courtID], it mirrors the value on KlerosCore.
    address public governor;
    IFastBridgeReceiver public fastBridgeReceiver;
    uint256 public immutable override senderChainID;
    address public override senderGateway;
    IFastBridgeReceiver public depreciatedFastbridge;
    uint256 public depreciatedFastBridgeExpiration;
    mapping(bytes32 => DisputeData) public disputeHashtoDisputeData;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyFromFastBridge() {
        require(
            address(fastBridgeReceiver) == msg.sender ||
                ((block.timestamp < depreciatedFastBridgeExpiration) &&
                    address(depreciatedFastbridge) == msg.sender),
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
        uint256 _senderChainID,
        IERC20 _weth
    ) {
        governor = _governor;
        fastBridgeReceiver = _fastBridgeReceiver;
        senderGateway = _senderGateway;
        senderChainID = _senderChainID;
        weth = _weth;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /**
     * @dev Changes the governor.
     * @param _governor The address of the new governor.
     */
    function changeGovernor(address _governor) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        governor = _governor;
    }

    /**
     * @dev Changes the fastBridge, useful to increase the claim deposit.
     * @param _fastBridgeReceiver The address of the new fastBridge.
     * @param _gracePeriod The duration to accept messages from the deprecated bridge (if at all).
     */
    function changeFastbridge(
        IFastBridgeReceiver _fastBridgeReceiver,
        uint256 _gracePeriod
    ) external onlyByGovernor {
        // grace period to relay remaining messages in the relay / bridging process
        depreciatedFastBridgeExpiration =
            block.timestamp +
            _fastBridgeReceiver.epochPeriod() +
            _gracePeriod; // 2 weeks
        depreciatedFastbridge = fastBridgeReceiver;
        fastBridgeReceiver = _fastBridgeReceiver;
    }

    /**
     * @dev Changes the sender gateway.
     * @param _senderGateway The address of the new sender gateway.
     */
    function changeReceiverGateway(address _senderGateway) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        senderGateway = _senderGateway;
    }

    /**
     * @dev Changes the `feeForJuror` property value of a specified court.
     * @param _courtID The ID of the court.
     * @param _feeForJuror The new value for the `feeForJuror` property value.
     */
    function changeCourtJurorFee(
        uint96 _courtID,
        uint256 _feeForJuror
    ) external onlyByGovernor {
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
        require(
            _amount >= arbitrationCost(_extraData),
            "Not paid enough for arbitration"
        );

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
            paid: _amount,
            relayer: address(0),
            ruled: false
        });

        emit OutgoingDispute(
            disputeHash,
            blockhash(block.number - 1),
            disputeID,
            _choices,
            _extraData,
            msg.sender
        );
        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    function arbitrationCost(
        bytes calldata _extraData
    ) public view override returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors) = extraDataToCourtIDMinJurors(
            _extraData
        );
        cost = feeForJuror[courtID] * minJurors;
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
        require(
            _messageSender == senderGateway,
            "Only the homegateway is allowed."
        );
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
        weth.transfer(dispute.relayer, amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function disputeHashToForeignID(
        bytes32 _disputeHash
    ) external view override returns (uint256) {
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
