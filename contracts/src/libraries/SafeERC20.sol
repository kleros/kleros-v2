// SPDX-License-Identifier: MIT
// Adapted from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/a7a94c77463acea95d979aae1580fb0ddc3b6a1e/contracts/token/ERC20/utils/SafeERC20.sol

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title SafeERC20
/// @dev Wrappers around ERC20 operations that throw on failure (when the token
/// contract returns false). Tokens that return no value (and instead revert or
/// throw on failure) are also supported, non-reverting calls are assumed to be
/// successful.
/// To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
/// which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
library SafeERC20 {
    /// @dev Increases the allowance granted to `spender` by the caller.
    /// @param _token Token to transfer.
    /// @param _spender The address which will spend the funds.
    /// @param _addedValue The amount of tokens to increase the allowance by.
    function increaseAllowance(IERC20 _token, address _spender, uint256 _addedValue) internal returns (bool) {
        _token.approve(_spender, _token.allowance(address(this), _spender) + _addedValue);
        return true;
    }

    /// @dev Calls transfer() without reverting.
    /// @param _token Token to transfer.
    /// @param _to Recepient address.
    /// @param _value Amount transferred.
    /// @return Whether transfer succeeded or not.
    function safeTransfer(IERC20 _token, address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(_token).call(abi.encodeCall(IERC20.transfer, (_to, _value)));
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }

    /// @dev Calls transferFrom() without reverting.
    /// @param _token Token to transfer.
    /// @param _from Sender address.
    /// @param _to Recepient address.
    /// @param _value Amount transferred.
    /// @return Whether transfer succeeded or not.
    function safeTransferFrom(IERC20 _token, address _from, address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(_token).call(
            abi.encodeCall(IERC20.transferFrom, (_from, _to, _value))
        );
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }
}
