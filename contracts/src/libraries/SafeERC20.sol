// SPDX-License-Identifier: MIT
// Adapted from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/a7a94c77463acea95d979aae1580fb0ddc3b6a1e/contracts/token/ERC20/utils/SafeERC20.sol

pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title SafeERC20
///
/// @notice Wrappers around ERC20 operations
///
/// @dev Returns false instead of reverting.
/// Tokens that return no value (and instead revert or throw on failure) are also supported.
/// Non-reverting calls are assumed to be successful.
/// To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
/// which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
library SafeERC20 {
    /// @notice Calls transfer() without reverting.
    /// @param _token Token to transfer.
    /// @param _to Recipient address.
    /// @param _value Amount transferred.
    /// @return Whether transfer succeeded or not.
    function safeTransfer(IERC20 _token, address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(_token).call(abi.encodeCall(IERC20.transfer, (_to, _value)));
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }

    /// @notice Calls transferFrom() without reverting.
    /// @param _token Token to transfer.
    /// @param _from Sender address.
    /// @param _to Recipient address.
    /// @param _value Amount transferred.
    /// @return Whether transfer succeeded or not.
    function safeTransferFrom(IERC20 _token, address _from, address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(_token).call(
            abi.encodeCall(IERC20.transferFrom, (_from, _to, _value))
        );
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }
}
