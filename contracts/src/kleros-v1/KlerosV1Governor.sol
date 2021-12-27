pragma solidity ^0.8;

import "./IKlerosLiquid.sol";
import "./ITokenController.sol";
import "../arbitration/IArbitrable.sol";
import "../arbitration/IArbitrator.sol";
import "../evidence/IEvidence.sol";

/**
 * @title ERC20 interface
 */
interface IPinakion {
    function balanceOf(address who) external view returns (uint256);
}

contract KlerosV1Governor is IArbitrable, IEvidence, ITokenController {
    struct DisputeData {
        uint256 klerosLiquidDisputeID;
        uint256 ruling;
        bool ruled;
        bool relayed;
    }

    address public governor;
    IArbitrator public foreignGateway;
    IKlerosLiquid public klerosLiquid;

    mapping(uint256 => uint256) public klerosLiquidDisputeIDtoGatewayDisputeID;
    mapping(uint256 => DisputeData) public disputes; // disputes[gatewayDisputeID]
    mapping(address => uint256) public frozenTokens; // frozenTokens[account] locked token which shouldn't have been blocked.
    mapping(uint256 => mapping(uint256 => bool)) public isDisputeNotified; // isDisputeNotified[disputeID][roundID] used to track the notification of frozen tokens.

    modifier onlyByGovernor() {
        require(governor == msg.sender);
        _;
    }

    /** @dev Constructor.
     *  @param _klerosLiquid The trusted arbitrator to resolve potential disputes.
     *  @param _governor The trusted governor of the contract.
     */
    constructor(
        IKlerosLiquid _klerosLiquid,
        address _governor,
        IArbitrator _foreignGateway
    ) {
        klerosLiquid = _klerosLiquid;
        governor = _governor;
        foreignGateway = _foreignGateway;
    }

    /** @dev Lets the governor call anything on behalf of the contract.
     *  @param _destination The destination of the call.
     *  @param _amount The value sent with the call.
     *  @param _data The data sent with the call.
     */
    function executeGovernorProposal(
        address _destination,
        uint256 _amount,
        bytes calldata _data
    ) external onlyByGovernor {
        (bool success, ) = _destination.call{value: _amount}(_data); // solium-disable-line security/no-call-value
        require(success, "Call execution failed.");
    }

    function startMigration() external {
        uint256[4] memory timesPerPeriod;
        for (uint96 subcourtID = 0; subcourtID <= 23; subcourtID++) {
            // Set evidence periods to infinity
            (, timesPerPeriod) = klerosLiquid.getSubcourt(subcourtID);

            klerosLiquid.changeSubcourtTimesPerPeriod(
                subcourtID,
                [type(uint256).max, timesPerPeriod[1], timesPerPeriod[2], timesPerPeriod[3]]
            );
        }
    }

    function relayDispute(uint256 _disputeID) external {
        require(klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] == 0, "Dispute already relayed");
        IKlerosLiquid.Dispute memory KlerosLiquidDispute = klerosLiquid.disputes(_disputeID);
        (
            uint256[] memory votesLengths,
            uint256[] memory tokensAtStakePerJuror,
            uint256[] memory totalFeesForJurors,
            ,
            ,

        ) = klerosLiquid.getDispute(_disputeID);

        // Check that no juror was yet drawn. Add a function to finalize the juror drawing and move the dispute to vote.
        require(votesLengths.length == 1, "Cannot relay. Evidence period cannot be locked.");
        require(KlerosLiquidDispute.period == IKlerosLiquid.Period.evidence, "Invalid dispute period.");
        require(tokensAtStakePerJuror[0] == 0, "Jurors can get their PNK locked.");

        klerosLiquid.executeGovernorProposal(address(this), totalFeesForJurors[0], "");

        uint256 minJurors = votesLengths[0];
        bytes memory extraData = abi.encode(KlerosLiquidDispute.subcourtID, minJurors);
        uint256 arbitrationCost = foreignGateway.arbitrationCost(extraData);
        require(totalFeesForJurors[0] >= arbitrationCost, "Fees not high enough."); // If this doesn't hold at some point, it could be a big issue.
        uint256 gatewayDisputeID = foreignGateway.createDispute(KlerosLiquidDispute.numberOfChoices, extraData);
        klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] = gatewayDisputeID;

        DisputeData storage dispute = disputes[gatewayDisputeID];
        dispute.klerosLiquidDisputeID = _disputeID;
    }

    /** @dev Give a ruling for a dispute. Can only be called by the arbitrator. TRUSTED.
     *  Account for the situation where the winner loses a case due to paying less appeal fees than expected.
     *  @param _disputeID ID of the dispute in the arbitrator contract.
     *  @param _ruling Ruling given by the arbitrator. Note that 0 is reserved for "Refused to arbitrate".
     */
    function rule(uint256 _disputeID, uint256 _ruling) public {
        require(msg.sender == address(foreignGateway), "Not the arbitrator.");
        DisputeData storage dispute = disputes[_disputeID];
        require(dispute.klerosLiquidDisputeID != 0, "Dispute does not exist.");
        require(!dispute.ruled, "Dispute already ruled.");

        dispute.ruled = true;
        dispute.ruling = _ruling;

        emit Ruling(foreignGateway, _disputeID, _ruling);
    }

    function executeRuling(uint256 _disputeID, uint256 _ruling) external {
        DisputeData storage dispute = disputes[_disputeID];
        IKlerosLiquid.Dispute memory klerosLiquidDispute = klerosLiquid.disputes(dispute.klerosLiquidDisputeID);
        require(!dispute.relayed, "Ruling already sent.");
        dispute.relayed = true;

        bytes4 functionSelector = IArbitrable.rule.selector;
        bytes memory data = abi.encodeWithSelector(functionSelector, dispute.klerosLiquidDisputeID, _ruling);
        klerosLiquid.executeGovernorProposal(klerosLiquidDispute.arbitrated, 0, data);
    }

    function notifyFrozenTokens(uint256 _disputeID) external {
        require(klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] != 0, "Dispute not relayed.");
        (uint256[] memory votesLengths, uint256[] memory tokensAtStakePerJuror, , , , ) = klerosLiquid.getDispute(
            _disputeID
        );

        for (uint256 round = 0; round < votesLengths.length; round++) {
            if (isDisputeNotified[_disputeID][round]) continue;

            for (uint256 voteID = 0; voteID < votesLengths[round]; voteID++) {
                (address account, , , ) = klerosLiquid.getVote(_disputeID, round, voteID);
                frozenTokens[account] += tokensAtStakePerJuror[round];
            }
            isDisputeNotified[_disputeID][round] = true;
        }
    }

    /** @dev Called when `_owner` sends ether to the MiniMe Token contract.
     *  @param _owner The address that sent the ether to create tokens.
     *  @return allowed Whether the operation should be allowed or not.
     */
    function proxyPayment(address _owner) external payable returns (bool allowed) {
        allowed = false;
    }

    /** @dev Notifies the controller about a token transfer allowing the controller to react if desired.
     *  @param _from The origin of the transfer.
     *  @param _to The destination of the transfer.
     *  @param _amount The amount of the transfer.
     *  @return allowed Whether the operation should be allowed or not.
     */
    function onTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external returns (bool allowed) {
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

    /** @dev Notifies the controller about an approval allowing the controller to react if desired.
     *  @param _owner The address that calls `approve()`.
     *  @param _spender The spender in the `approve()` call.
     *  @param _amount The amount in the `approve()` call.
     *  @return allowed Whether the operation should be allowed or not.
     */
    function onApprove(
        address _owner,
        address _spender,
        uint256 _amount
    ) external returns (bool allowed) {
        allowed = true;
    }

    receive() external payable {}
}
