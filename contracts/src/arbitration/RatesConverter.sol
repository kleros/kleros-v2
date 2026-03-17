// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IRatesConverter} from "./interfaces/IRatesConverter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title RatesConverter
/// @notice Converts ETH amounts to fee token amounts using a fixed rate set by governance.
contract RatesConverter is IRatesConverter {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct CurrencyRate {
        uint64 rateInEth; // Rate of the fee token in ETH.
        uint8 rateDecimals; // Decimals of the fee token rate.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner = msg.sender;
    mapping(IERC20 => CurrencyRate) public currencyRates; // The rate of each token denominated in ETH.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when the fee for a particular ERC20 token is updated.
    /// @param _feeToken The ERC20 token.
    /// @param _rateInEth The new rate of the fee token in ETH.
    /// @param _rateDecimals The new decimals of the fee token rate.
    event NewCurrencyRate(IERC20 indexed _feeToken, uint64 _rateInEth, uint8 _rateDecimals);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the currency rate of a fee token.
    /// @param _feeToken The fee token.
    /// @param _rateInEth The new rate of the fee token in ETH.
    /// @param _rateDecimals The new decimals of the fee token rate.
    function changeCurrencyRates(IERC20 _feeToken, uint64 _rateInEth, uint8 _rateDecimals) external onlyByOwner {
        currencyRates[_feeToken].rateInEth = _rateInEth;
        currencyRates[_feeToken].rateDecimals = _rateDecimals;
        emit NewCurrencyRate(_feeToken, _rateInEth, _rateDecimals);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Converts ETH into tokens.
    /// @param _toToken The token to convert ETH into.
    /// @param _amountInEth ETH amount.
    /// @return Amount of tokens.
    function convert(IERC20 _toToken, uint256 _amountInEth) external view override returns (uint256) {
        return (_amountInEth * 10 ** currencyRates[_toToken].rateDecimals) / currencyRates[_toToken].rateInEth;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
}
