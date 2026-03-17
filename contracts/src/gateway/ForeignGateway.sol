// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IForeignGateway} from "./interfaces/IForeignGateway.sol";
import {IArbitrableV2} from "../arbitration/interfaces/IArbitrableV2.sol";
import {IArbitratorV2} from "../arbitration/interfaces/IArbitratorV2.sol";
import {IReceiverGateway} from "@kleros/vea-contracts/src/interfaces/gateways/IReceiverGateway.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {Initializable} from "../proxy/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/Constants.sol";

/// @title Foreign Gateway
/// @notice Counterpart of `HomeGateway`
contract ForeignGateway is IForeignGateway, UUPSProxiable, Initializable {
    string public constant override version = "0.8.0";

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
    mapping(uint96 courtId => uint256) public feeForJuror; // feeForJuror[v2CourtID], it mirrors the value on KlerosCore.
    address public owner;
    address public veaOutbox;
    uint256 public override homeChainID;
    address public override homeGateway;
    address public deprecatedVeaOutbox;
    uint256 public deprecatedVeaOutboxExpiration;
    mapping(bytes32 disputeHash => DisputeData) public disputeHashtoDisputeData;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyFromVea(address _messageSender) {
        require(
            veaOutbox == msg.sender ||
                (block.timestamp < deprecatedVeaOutboxExpiration && deprecatedVeaOutbox == msg.sender),
            VeaOutboxOnly()
        );
        require(_messageSender == homeGateway, HomeGatewayMessageSenderOnly());
        _;
    }

    modifier onlyByOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Constructs the `PolicyRegistry` contract.
    /// @param _owner The owner's address.
    /// @param _veaOutbox The address of the VeaOutbox.
    /// @param _homeChainID The chainID of the home chain.
    /// @param _homeGateway The address of the home gateway.
    function initialize(
        address _owner,
        address _veaOutbox,
        uint256 _homeChainID,
        address _homeGateway
    ) external initializer {
        owner = _owner;
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
     * @dev Only the owner can perform upgrades (`onlyByOwner`)
     */
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Changes the owner.
    /// @param _owner The address of the new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the outbox.
    /// @param _veaOutbox The address of the new outbox.
    /// @param _gracePeriod The duration to accept messages from the deprecated bridge (if at all).
    function changeVea(address _veaOutbox, uint256 _gracePeriod) external onlyByOwner {
        // grace period to relay the remaining messages which are still going through the deprecated bridge.
        deprecatedVeaOutboxExpiration = block.timestamp + _gracePeriod;
        deprecatedVeaOutbox = veaOutbox;
        veaOutbox = _veaOutbox;
    }

    /// @notice Changes the home gateway.
    /// @param _homeGateway The address of the new home gateway.
    function changeHomeGateway(address _homeGateway) external onlyByOwner {
        homeGateway = _homeGateway;
    }

    /// @notice Changes the `feeForJuror` property value of a specified court.
    /// @param _courtID The ID of the court on the v2 arbitrator. Not to be confused with the courtID on KlerosLiquid.
    /// @param _feeForJuror The new value for the `feeForJuror` property value.
    function changeCourtJurorFee(uint96 _courtID, uint256 _feeForJuror) external onlyByOwner {
        feeForJuror[_courtID] = _feeForJuror;
        emit ArbitrationCostModified(_courtID, _feeForJuror);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Create a dispute and pay for the fees in the native currency, typically ETH.
    /// @dev Must be called by the arbitrable contract and pay at least `arbitrationCost(_extraData)` in ETH.
    /// @param _choices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return disputeID The identifier of the dispute created.
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData
    ) external payable override returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), ArbitrationFeesNotEnough());

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

    function createDispute(
        uint256 /*_choices*/,
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/,
        uint256 /*_feeAmount*/
    ) external pure override returns (uint256) {
        revert("Not supported");
    }

    /// @notice Compute the cost of arbitration denominated in the native currency, typically ETH.
    /// @dev It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return cost The arbitration cost in ETH.
    function arbitrationCost(bytes calldata _extraData) public view override returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors) = extraDataToCourtIDMinJurors(_extraData);
        cost = feeForJuror[courtID] * minJurors;
    }

    function arbitrationCost(
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/
    ) public pure override returns (uint256 /*cost*/) {
        revert("Not supported");
    }

    /// @notice Relay the rule call from the home gateway to the arbitrable.
    /// @param _messageSender The address of the message sender.
    /// @param _disputeHash The dispute hash.
    /// @param _ruling The ruling.
    /// @param _relayer The address of the relayer.
    function relayRule(
        address _messageSender,
        bytes32 _disputeHash,
        uint256 _ruling,
        address _relayer
    ) external override onlyFromVea(_messageSender) {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];

        require(dispute.id != 0, DisputeDoesNotExist());
        require(!dispute.ruled, CannotRuleTwice());

        dispute.ruled = true;
        dispute.relayer = _relayer;

        IArbitrableV2 arbitrable = IArbitrableV2(dispute.arbitrable);
        arbitrable.rule(dispute.id, _ruling);
    }

    /// @notice Reimburses the dispute fees to the relayer who paid for these fees on the home chain.
    /// @param _disputeHash The dispute hash for which to withdraw the fees.
    function withdrawFees(bytes32 _disputeHash) external override {
        DisputeData storage dispute = disputeHashtoDisputeData[_disputeHash];
        require(dispute.id != 0, DisputeDoesNotExist());
        require(dispute.ruled, NotRuledYet());

        uint256 amount = dispute.paid;
        dispute.paid = 0;
        payable(dispute.relayer).transfer(amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Looks up the local foreign disputeID for a disputeHash
    /// @param _disputeHash The dispute hash.
    /// @return The local foreign disputeID.
    function disputeHashToForeignID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
    }

    function senderGateway() external view override returns (address) {
        return homeGateway;
    }

    function currentRuling(
        uint256 /*_disputeID*/
    ) public pure returns (uint256 /*ruling*/, bool /*tied*/, bool /*overridden*/) {
        revert("Not supported");
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

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

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error HomeGatewayMessageSenderOnly();
    error VeaOutboxOnly();
    error ArbitrationFeesNotEnough();
    error DisputeDoesNotExist();
    error CannotRuleTwice();
    error NotRuledYet();
}
