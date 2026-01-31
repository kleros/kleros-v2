// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title RatesConverter
/// @notice RatesConverter interface for the Kleros V2 protocol.
interface IRatesConverter {
    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Converts ETH into tokens.
    /// @param _toToken The token to convert ETH into.
    /// @param _amountInEth ETH amount.
    /// @return Amount of tokens.
    function convert(IERC20 _toToken, uint256 _amountInEth) external view returns (uint256);
}
