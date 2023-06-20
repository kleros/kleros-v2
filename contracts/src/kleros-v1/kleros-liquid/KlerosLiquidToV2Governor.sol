// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "../interfaces/IKlerosLiquid.sol";
import "../interfaces/ITokenController.sol";
import {IArbitratorV2, IArbitrableV2} from "../../arbitration/interfaces/IArbitratorV2.sol";

interface IPinakion {
    function balanceOf(address who) external view returns (uint256);
}

contract KlerosLiquidToV2Governor is IArbitrableV2, ITokenController {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DisputeData {
        uint256 klerosLiquidDisputeID;
        bool ruled;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbitratorV2 public immutable foreignGateway;
    IKlerosLiquid public immutable klerosLiquid;
    address public governor;
    mapping(uint256 => uint256) public klerosLiquidDisputeIDtoGatewayDisputeID;
    mapping(uint256 => DisputeData) public disputes; // disputes[gatewayDisputeID]
    mapping(address => uint256) public frozenTokens; // frozenTokens[account] locked token which shouldn't have been blocked.
    mapping(uint256 => mapping(uint256 => bool)) public isDisputeNotified; // isDisputeNotified[disputeID][roundID] used to track the notification of frozen tokens.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender);
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor. Before this contract is made the new governor of KlerosLiquid, the evidence period of all subcourts has to be set to uint(-1).
    /// @param _klerosLiquid The trusted arbitrator to resolve potential disputes.
    /// @param _governor The trusted governor of the contract.
    /// @param _foreignGateway The trusted gateway that acts as an arbitrator, relaying disputes to v2.
    constructor(IKlerosLiquid _klerosLiquid, address _governor, IArbitratorV2 _foreignGateway) {
        klerosLiquid = _klerosLiquid;
        governor = _governor;
        foreignGateway = _foreignGateway;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Lets the governor call anything on behalf of the contract.
    /// @param _destination The destination of the call.
    /// @param _amount The value sent with the call.
    /// @param _data The data sent with the call.
    function executeGovernorProposal(
        address _destination,
        uint256 _amount,
        bytes calldata _data
    ) external onlyByGovernor {
        (bool success, ) = _destination.call{value: _amount}(_data); // solium-disable-line security/no-call-value
        require(success, "Call execution failed.");
    }

    /// @dev Changes the `governor` storage variable.
    /// @param _governor The new value for the `governor` storage variable.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Relays disputes from KlerosLiquid to Kleros v2. Only disputes in the evidence period of the initial round can be realyed.
    /// @param _disputeID The ID of the dispute as defined in KlerosLiquid.
    function relayDispute(uint256 _disputeID) external {
        require(klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] == 0, "Dispute already relayed");
        IKlerosLiquid.Dispute memory KlerosLiquidDispute = klerosLiquid.disputes(_disputeID);
        (uint256[] memory votesLengths, , uint256[] memory totalFeesForJurors, , , ) = klerosLiquid.getDispute(
            _disputeID
        );

        require(KlerosLiquidDispute.period == IKlerosLiquid.Period.evidence, "Invalid dispute period.");
        require(votesLengths.length == 1, "Cannot relay appeals.");

        klerosLiquid.executeGovernorProposal(address(this), totalFeesForJurors[0], "");

        uint256 minJurors = votesLengths[0];
        bytes memory extraData = abi.encode(KlerosLiquidDispute.subcourtID, minJurors);
        uint256 arbitrationCost = foreignGateway.arbitrationCost(extraData);
        require(totalFeesForJurors[0] >= arbitrationCost, "Fees not high enough."); // If this doesn't hold at some point, it could be a big issue.
        uint256 gatewayDisputeID = foreignGateway.createDispute{value: arbitrationCost}(
            KlerosLiquidDispute.numberOfChoices,
            extraData
        );
        klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] = gatewayDisputeID;
        require(gatewayDisputeID != 0, "ID must be greater than 0.");

        DisputeData storage dispute = disputes[gatewayDisputeID];
        dispute.klerosLiquidDisputeID = _disputeID;
    }

    /// @inheritdoc IArbitrableV2
    function rule(uint256 _disputeID, uint256 _ruling) public override {
        require(msg.sender == address(foreignGateway), "Not the arbitrator.");
        DisputeData storage dispute = disputes[_disputeID];
        require(dispute.klerosLiquidDisputeID != 0, "Dispute does not exist.");
        require(!dispute.ruled, "Dispute already ruled.");

        dispute.ruled = true;

        emit Ruling(foreignGateway, _disputeID, _ruling);

        IKlerosLiquid.Dispute memory klerosLiquidDispute = klerosLiquid.disputes(dispute.klerosLiquidDisputeID);

        bytes memory data = abi.encodeCall(IArbitrableV2.rule, (dispute.klerosLiquidDisputeID, _ruling));
        klerosLiquid.executeGovernorProposal(klerosLiquidDispute.arbitrated, 0, data);
    }

    /// @dev Registers jurors' tokens which where locked due to relaying a given dispute. These tokens don't count as locked.
    /// @param _disputeID The ID of the dispute as defined in KlerosLiquid.
    function notifyFrozenTokens(uint256 _disputeID) external {
        require(klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] != 0, "Dispute not relayed.");
        (uint256[] memory votesLengths, uint256[] memory tokensAtStakePerJuror, , , , ) = klerosLiquid.getDispute(
            _disputeID
        );

        uint256 minStakingTime = klerosLiquid.minStakingTime();
        IKlerosLiquid.Phase phase = klerosLiquid.phase();
        bool isDrawingForbidden = phase == IKlerosLiquid.Phase.staking && minStakingTime == type(uint256).max;

        for (uint256 round = 0; round < votesLengths.length; round++) {
            if (isDisputeNotified[_disputeID][round]) continue;

            for (uint256 voteID = 0; voteID < votesLengths[round]; voteID++) {
                (address account, , , ) = klerosLiquid.getVote(_disputeID, round, voteID);
                require(account != address(0x0) || isDrawingForbidden, "Juror not drawn yet.");
                if (account != address(0x0)) frozenTokens[account] += tokensAtStakePerJuror[round];
            }
            isDisputeNotified[_disputeID][round] = true;
        }
    }

    /// @inheritdoc ITokenController
    function proxyPayment(address /*_owner*/) external payable override returns (bool allowed) {
        allowed = false;
    }

    /// @inheritdoc ITokenController
    function onTransfer(address _from, address /*_to*/, uint256 _amount) external view override returns (bool allowed) {
        if (klerosLiquid.lockInsolventTransfers()) {
            // Never block penalties or rewards.
            IPinakion pinakion = IPinakion(klerosLiquid.pinakion());
            uint256 newBalance = pinakion.balanceOf(_from) - _amount; // Overflow already checked in the Minime token contract.

            IKlerosLiquid.Juror memory juror = klerosLiquid.jurors(_from);

            // frozenTokens <= lockedTokens always.
            if (newBalance < juror.stakedTokens || newBalance < juror.lockedTokens - frozenTokens[_from]) return false;
        }
        allowed = true;
    }

    /// @inheritdoc ITokenController
    function onApprove(
        address /*_owner*/,
        address /*_spender*/,
        uint256 /*_amount*/
    ) external pure override returns (bool allowed) {
        allowed = true;
    }

    /// @dev This contract should be able to receive arbitration fees from KlerosLiquid.
    receive() external payable {}
}
