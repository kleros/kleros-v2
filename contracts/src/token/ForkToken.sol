// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ForkToken
/// @notice A minority-fork token (`PNK2 … PNKₙ`), one ERC-20 deployed per non-empty minority fork
///         when a forking round settles. The owner (the `ForkSettlement` contract) is the sole
///         mint authority and credits each fork joiner their genesis balance.
/// @dev Modelled on `PinakionV2`: a mintable ERC-20 that re-adds the OZ-v5-dropped
///      `increaseAllowance` / `decreaseAllowance` helpers for PNK-interface parity.
contract ForkToken is ERC20, Ownable {
    /// @param _name The token name, e.g. "Kleros Fork Token 2".
    /// @param _symbol The token symbol, e.g. "PNK2".
    /// @param _owner The owner and mint authority, typically the `ForkSettlement` contract.
    constructor(string memory _name, string memory _symbol, address _owner) ERC20(_name, _symbol) Ownable(_owner) {}

    /// @notice Mints `amount` fork tokens to `to`. Only callable by the owner (settlement).
    /// @param to The genesis recipient.
    /// @param amount The genesis balance.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @dev Re-added because OZ v5 removed it; expected by the PNK token interface.
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address sender = _msgSender();
        _approve(sender, spender, allowance(sender, spender) + addedValue);
        return true;
    }

    /// @dev Re-added because OZ v5 removed it; expected by the PNK token interface.
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address sender = _msgSender();
        uint256 currentAllowance = allowance(sender, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(sender, spender, currentAllowance - subtractedValue);
        }
        return true;
    }
}
