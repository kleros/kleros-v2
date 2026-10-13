// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

/**
 * @title IDispatchVoucher
 * @dev Copied from kleros/vea veashi-contracts/src/interfaces/IDispatchVoucher.sol (fix/veashi-audit a04190b).
 * @dev Implemented by a reporter's dispatcher (a gateway) to vouch for the message it is dispatching through Yaho.
 */
interface IDispatchVoucher {
    /**
     * @dev Returns true while this contract is dispatching the message with the given hash through Yaho.
     * @param messageHash - The Hashi message hash a reporter is asked to dispatch.
     */
    function isDispatching(bytes32 messageHash) external view returns (bool);
}
