// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/arbitrum/IInbox.sol";
import "./interfaces/arbitrum/IOutbox.sol";
import "./interfaces/arbitrum/IArbRetryableTx.sol";
import "./interfaces/ISafeBridgeSender.sol";

/**
 * Safe Bridge Sender to Arbitrum from Ethereum
 * Counterpart of `SafeBridgeReceiverOnArbitrumFromEthereum` if any
 */
contract SafeBridgeSenderToArbitrumFromEthereum is ISafeBridgeSender {
    IArbRetryableTx public constant ARBITRUM_RETRYABLE_TX = IArbRetryableTx(address(110));
    address public immutable safeBridgeSender;
    IInbox public immutable inbox;
    uint256 public immutable maxGas;
    uint256 public immutable gasPriceBid;

    event RetryableTicketCreated(uint256 indexed ticketId);

    /**
     * @param _inbox The Arbitrum Inbox address on Ethereum.
     * @param _maxGas Gas limit for immediate L2 execution attempt.
     * @param _gasPriceBid L2 Gas price bid for immediate L2 execution attempt.
     */
    constructor(
        address _safeBridgeSender,
        address _inbox,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) {
        safeBridgeSender = _safeBridgeSender;
        inbox = IInbox(_inbox);
        maxGas = _maxGas;
        gasPriceBid = _gasPriceBid;
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
     * @param _receiver The cross-domain target on Arbitrum.
     * @param _calldata The encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (uint256) {
        require(msg.sender == safeBridgeSender, "Access not allowed: Safe Bridge Sender only.");

        uint256 baseSubmissionCost = bridgingCost(_calldata.length);
        require(msg.value >= baseSubmissionCost + (maxGas * gasPriceBid));

        uint256 ticketID = inbox.createRetryableTicket{value: msg.value}(
            _receiver,
            0,
            baseSubmissionCost,
            msg.sender,
            msg.sender,
            maxGas,
            gasPriceBid,
            _calldata
        );

        emit RetryableTicketCreated(ticketID);
        return ticketID;
    }

    function bridgingCost(uint256 _calldatasize) internal view returns (uint256) {
        (uint256 submissionCost, ) = ARBITRUM_RETRYABLE_TX.getSubmissionPrice(_calldatasize);
        return submissionCost;
    }
}
