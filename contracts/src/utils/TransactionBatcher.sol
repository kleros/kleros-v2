// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Adapted from https://github.com/daostack/web3-transaction-batcher/blob/1b88d2ea062f8f2d9fdfdf9bbe85d2bbef780151/contracts/Batcher.sol

contract TransactionBatcher {
    function batchSend(address[] memory targets, uint256[] memory values, bytes[] memory datas) public payable {
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, ) = targets[i].call{value: values[i]}(datas[i]);
            if (!success) revert("transaction failed"); // All the calls must succeed.
        }
    }

    function batchSendUnchecked(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable {
        for (uint256 i = 0; i < targets.length; i++) {
            /// forge-lint: disable-next-line(unchecked-call)
            targets[i].call{value: values[i]}(datas[i]); // Intentionally ignoring return value.
        }
    }
}
