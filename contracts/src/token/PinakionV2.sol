// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../libraries/SafeERC20.sol";

/// @custom:security-contact contact@kleros.io
contract PinakionV2 is ERC20, ERC20Burnable, Ownable {
    using SafeERC20 for IERC20;

    constructor() ERC20("PinakionV2", "PNK") {
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
}
