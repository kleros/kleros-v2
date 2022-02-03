// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/IInbox.sol";
import "./interfaces/IOutbox.sol";
import "./interfaces/IArbRetryableTx.sol";

import "../ISafeBridge.sol";

contract ArbL1Bridge is ISafeBridge {
    address public crossDomainTarget;
    IInbox public inbox;
    IArbRetryableTx constant arbRetryableTx = IArbRetryableTx(address(110));

    event RetryableTicketCreated(uint256 indexed ticketId);

    constructor(address _crossDomainTarget, address _inbox) {
        crossDomainTarget = _crossDomainTarget;
        inbox = IInbox(_inbox);
    }

    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @dev The caller needs to pay some ETH to cover the gas costs
     * of the call on L2. Excess ETH that is not used by gas costs will
     * be refunded to the `msg.sender` address on L2.
     *
     * @notice if a user does not desire immediate redemption, they should
     * provide a DepositValue of at least CallValue + MaxSubmissionCost.
     * If they do desire immediate execution, they should provide a DepositValue
     * of at least CallValue + MaxSubmissionCost + (GasPrice x MaxGas).
     *
     * @param _calldata The L2 encoded message data.
     * @param _maxGas Gas limit for immediate L2 execution attempt.
     * @param _gasPriceBid L2 Gas price bid for immediate L2 execution attempt.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) internal override returns (uint256) {
        uint256 baseSubmissionCost = bridgingCost(_calldata.length);
        require(msg.value >= baseSubmissionCost + (_maxGas * _gasPriceBid));

        uint256 ticketID = inbox.createRetryableTicket{value: msg.value}(
            crossDomainTarget,
            0,
            baseSubmissionCost,
            msg.sender,
            msg.sender,
            _maxGas,
            _gasPriceBid,
            _calldata
        );

        emit RetryableTicketCreated(ticketID);
        return ticketID;
    }

    function bridgingCost(uint256 _calldatasize) internal view override returns (uint256) {
        (uint256 submissionCost, ) = arbRetryableTx.getSubmissionPrice(_calldatasize);
        return submissionCost;
    }

    function onlyCrossChainSender() internal override {
        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        address l2Sender = outbox.l2ToL1Sender();
        require(l2Sender == crossDomainTarget, "Only L2 target");
    }
}
