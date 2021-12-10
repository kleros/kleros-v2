// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IInbox.sol";
import "./interfaces/IArbRetryableTx.sol";

contract L1Bridge {
    address public l2Target;
    IInbox public inbox;
    IArbRetryableTx constant arbRetryableTx = IArbRetryableTx(address(110));

    event RetryableTicketCreated(uint256 indexed ticketId);

    constructor(address _l2Target, address _inbox) {
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
     * @param _maxGas Gas limit for immediate L2 execution attempt.
     * @param _gasPriceBid L2 Gas price bid for immediate L2 execution attempt.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) external payable returns (uint256) {
        uint256 baseSubmissionCost = getSubmissionPrice(_calldata.length);

        uint256 ticketID = inbox.createRetryableTicket{value: msg.value}(
            l2Target,
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

    function getSubmissionPrice(uint256 _calldatasize) public view returns (uint256) {
        (uint256 submissionCost, ) = arbRetryableTx.getSubmissionPrice(_calldatasize);
        return submissionCost;
    }
}
