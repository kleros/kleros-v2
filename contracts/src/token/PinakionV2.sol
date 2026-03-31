// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";

/// @title PinakionV2
/// @dev Simplified version of Arbitrum's StandardArbERC20 contract.
/// @dev This contract is deployed automatically by the Arbitrum bridge as a standardArbERC20.sol, it is only intended for local deployment.
/// @dev https://github.com/OffchainLabs/token-bridge-contracts/blob/main/contracts/tokenbridge/arbitrum/StandardArbERC20.sol
contract PinakionV2 is ERC20, ERC20Burnable, Ownable {
    using SafeERC20 for IERC20;

    constructor() ERC20("PinakionV2", "PNK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /// @notice Recover tokens sent mistakenly to this contract.
    /// @param _token The address of the token contract that you want to recover, or set to 0 in case you want to extract ether.
    function recoverTokens(address _token) public onlyOwner {
        if (_token == address(0)) {
            require(payable(owner()).send(address(this).balance), "Transfer failed");
            return;
        }

        IERC20 token = IERC20(_token);
        uint balance = token.balanceOf(address(this));
        require(token.safeTransfer(payable(owner()), balance), "Token transfer failed");
    }

    /// @dev Necessary because OZ v5 has removed the increaseAllowance and decreaseAllowance functions, but they are expected to exist by the existing PinakionV2 contract.
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /// @dev Necessary because OZ v5 has removed the increaseAllowance and decreaseAllowance functions, but they are expected to exist by the existing PinakionV2 contract.
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }
        return true;
    }
}
