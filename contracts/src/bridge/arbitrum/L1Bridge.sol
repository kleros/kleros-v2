// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./interfaces/IInbox.sol";

contract L1Bridge {
    address public l2Target;
    IInbox public inbox;

    event RetryableTicketCreated(uint256 indexed ticketId);

    constructor(address _l2Target, address _inbox) public {
        l2Target = _l2Target;
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
     * @param _maxSubmissionCost Amount of ETH allocated to pay for the base submission fee.
     *         The base submission fee to cover the storage costs of keeping
     *         their ticket’s calldata in the retry buffer.
     * @param _maxGas Gas limit for immediate L2 execution attempt.
     * @param _gasPriceBid L2 Gas price bid for immediate L2 execution attempt.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256 _maxSubmissionCost,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) external payable returns (uint256) {
        uint256 ticketID = inbox.createRetryableTicket{value: msg.value}(
            l2Target,
            0,
            _maxSubmissionCost,
            msg.sender,
            msg.sender,
            _maxGas,
            _gasPriceBid,
            _calldata
        );

        emit RetryableTicketCreated(ticketID);
        return ticketID;
    }
}
