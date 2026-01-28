// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "../../libraries/SafeERC20.sol";

/// @custom:security-contact contact@kleros.io
contract PinakionV2Local is ERC20, ERC20Burnable, Ownable {
    using SafeERC20 for IERC20;

    constructor() ERC20("PinakionV2Local", "PNK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /// @notice Recover tokens sent mistakenly to this contract.
    /// @param _token The address of the token contract that you want to recover, or set to 0 in case you want to extract ether.
    function recoverTokens(address _token) public onlyOwner {
        if (_token == address(0)) {
            (bool success, ) = payable(owner()).call{value: address(this).balance}("");
            require(success, "Transfer failed");
            return;
        }

        IERC20 token = IERC20(_token);
        uint balance = token.balanceOf(address(this));
        token.safeTransfer(owner(), balance);
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

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
