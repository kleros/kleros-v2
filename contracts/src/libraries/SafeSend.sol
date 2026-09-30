/**
 * @custom:authors: [@andreimvp]
 * @custom:reviewers: [@divyangchauhan, @wadader, @fcanela, @unknownunknown1]
 * @custom:auditors: []
 * @custom:bounties: []
 * SPDX-License-Identifier: MIT
 */

pragma solidity ^0.8.28;

/// @title WethLike
/// @notice a WETH-like contract to act as a fallback in case native transfer fails.
interface WethLike {
    /// @notice Wraps native ETH into WETH-like tokens.
    function deposit() external payable;

    /// @notice Transfers wrapped tokens to a recipient.
    /// @param dst Recipient address.
    /// @param wad Amount to transfer.
    function transfer(address dst, uint256 wad) external;
}

/// @title SafeSend
/// @notice Safely sends native ETH with WETH fallback.
library SafeSend {
    /// @notice Sends ETH to a recipient with WETH fallback.
    /// @param _to Recipient address.
    /// @param _value Amount to send.
    /// @param _wethLike Address of the WETH-like contract.
    function safeSend(address payable _to, uint256 _value, address _wethLike) internal {
        if (_to.send(_value)) return;

        WethLike(_wethLike).deposit{value: _value}();
        WethLike(_wethLike).transfer(_to, _value); /// forge-lint: disable-line(erc20-unchecked-transfer)
    }
}
