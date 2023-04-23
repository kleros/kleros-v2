// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "../interfaces/IKlerosLiquid.sol";
import "../interfaces/ITokenController.sol";
import "../../arbitration/IArbitrable.sol";
import "../../arbitration/IArbitrator.sol";

interface IPinakion {
    function balanceOf(address who) external view returns (uint256);
}

contract KlerosLiquidToV2Governor is IArbitrable, ITokenController {
    struct DisputeData {
        uint256 klerosLiquidDisputeID;
        bool ruled;
    }

    IArbitrator public immutable foreignGateway;
    IKlerosLiquid public immutable klerosLiquid;
    address public governor;

    mapping(uint256 => uint256) public klerosLiquidDisputeIDtoGatewayDisputeID;
    mapping(uint256 => DisputeData) public disputes; // disputes[gatewayDisputeID]
    mapping(address => uint256) public frozenTokens; // frozenTokens[account] locked token which shouldn't have been blocked.
    mapping(uint256 => mapping(uint256 => bool)) public isDisputeNotified; // isDisputeNotified[disputeID][roundID] used to track the notification of frozen tokens.

    modifier onlyByGovernor() {
        require(governor == msg.sender);
        _;
    }

    /** @dev Constructor. Before this contract is made the new governor of KlerosLiquid, the evidence period of all subcourts has to be set to uint(-1).
     *  @param _klerosLiquid The trusted arbitrator to resolve potential disputes.
     *  @param _governor The trusted governor of the contract.
     *  @param _foreignGateway The trusted gateway that acts as an arbitrator, relaying disputes to v2.
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

    /** @dev Changes the `governor` storage variable.
     *  @param _governor The new value for the `governor` storage variable.
     */
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /** @dev Relays disputes from KlerosLiquid to Kleros v2. Only disputes in the evidence period of the initial round can be realyed.
     *  @param _disputeID The ID of the dispute as defined in KlerosLiquid.
     */
    function relayDispute(uint256 _disputeID) external {
        require(
            klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] == 0,
            "Dispute already relayed"
        );
        IKlerosLiquid.Dispute memory KlerosLiquidDispute = klerosLiquid
            .disputes(_disputeID);
        (
            uint256[] memory votesLengths,
            ,
            uint256[] memory totalFeesForJurors,
            ,
            ,

        ) = klerosLiquid.getDispute(_disputeID);

        require(
            KlerosLiquidDispute.period == IKlerosLiquid.Period.evidence,
            "Invalid dispute period."
        );
        require(votesLengths.length == 1, "Cannot relay appeals.");

        klerosLiquid.executeGovernorProposal(
            address(this),
            totalFeesForJurors[0],
            ""
        );

        uint256 minJurors = votesLengths[0];
        bytes memory extraData = abi.encode(
            KlerosLiquidDispute.subcourtID,
            minJurors
        );
        uint256 arbitrationCost = foreignGateway.arbitrationCost(extraData);
        require(
            totalFeesForJurors[0] >= arbitrationCost,
            "Fees not high enough."
        ); // If this doesn't hold at some point, it could be a big issue.
        uint256 gatewayDisputeID = foreignGateway.createDispute{
            value: arbitrationCost
        }(KlerosLiquidDispute.numberOfChoices, extraData);
        klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] = gatewayDisputeID;
        require(gatewayDisputeID != 0, "ID must be greater than 0.");

        DisputeData storage dispute = disputes[gatewayDisputeID];
        dispute.klerosLiquidDisputeID = _disputeID;
    }

    /** @dev Give a ruling for a dispute. Can only be called by the arbitrator. TRUSTED.
     *  Triggers rule() from KlerosLiquid to the arbitrable contract which created the dispute.
     *  @param _disputeID ID of the dispute in the arbitrator contract.
     *  @param _ruling Ruling given by the arbitrator. Note that 0 is reserved for "Refused to arbitrate".
     */
    function rule(uint256 _disputeID, uint256 _ruling) public {
        require(msg.sender == address(foreignGateway), "Not the arbitrator.");
        DisputeData storage dispute = disputes[_disputeID];
        require(dispute.klerosLiquidDisputeID != 0, "Dispute does not exist.");
        require(!dispute.ruled, "Dispute already ruled.");

        dispute.ruled = true;

        emit Ruling(foreignGateway, _disputeID, _ruling);

        IKlerosLiquid.Dispute memory klerosLiquidDispute = klerosLiquid
            .disputes(dispute.klerosLiquidDisputeID);

        bytes4 functionSelector = IArbitrable.rule.selector;
        bytes memory data = abi.encodeWithSelector(
            functionSelector,
            dispute.klerosLiquidDisputeID,
            _ruling
        );
        klerosLiquid.executeGovernorProposal(
            klerosLiquidDispute.arbitrated,
            0,
            data
        );
    }

    /** @dev Registers jurors' tokens which where locked due to relaying a given dispute. These tokens don't count as locked.
     *  @param _disputeID The ID of the dispute as defined in KlerosLiquid.
     */
    function notifyFrozenTokens(uint256 _disputeID) external {
        require(
            klerosLiquidDisputeIDtoGatewayDisputeID[_disputeID] != 0,
            "Dispute not relayed."
        );
        (
            uint256[] memory votesLengths,
            uint256[] memory tokensAtStakePerJuror,
            ,
            ,
            ,

        ) = klerosLiquid.getDispute(_disputeID);

        uint256 minStakingTime = klerosLiquid.minStakingTime();
        IKlerosLiquid.Phase phase = klerosLiquid.phase();
        bool isDrawingForbidden = phase == IKlerosLiquid.Phase.staking &&
            minStakingTime == type(uint256).max;

        for (uint256 round = 0; round < votesLengths.length; round++) {
            if (isDisputeNotified[_disputeID][round]) continue;

            for (uint256 voteID = 0; voteID < votesLengths[round]; voteID++) {
                (address account, , , ) = klerosLiquid.getVote(
                    _disputeID,
                    round,
                    voteID
                );
                require(
                    account != address(0x0) || isDrawingForbidden,
                    "Juror not drawn yet."
                );
                if (account != address(0x0))
                    frozenTokens[account] += tokensAtStakePerJuror[round];
            }
            isDisputeNotified[_disputeID][round] = true;
        }
    }

    /** @dev Called when `_owner` sends ether to the MiniMe Token contract.
     *  @param _owner The address that sent the ether to create tokens.
     *  @return allowed Whether the operation should be allowed or not.
     */
    function proxyPayment(
        address _owner
    ) external payable returns (bool allowed) {
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
            if (
                newBalance < juror.stakedTokens ||
                newBalance < juror.lockedTokens - frozenTokens[_from]
            ) return false;
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

    /// @dev This contract should be able to receive arbitration fees from KlerosLiquid.
    receive() external payable {}
}
