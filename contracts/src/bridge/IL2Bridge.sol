// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * This is essentially an interface but defined as an abstract contract
 * to declare functions as internal instead of as external
 */
abstract contract IL2Bridge {
    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @param _calldata The L1 encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(bytes memory _calldata) internal virtual returns (uint256);

    function onlyCrossChainSender() internal virtual;
}
