// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Faucet {
    IERC20 public token;
    mapping(address => bool) public withdrewAlready;

    constructor(IERC20 _token) {
        token = _token;
    }

    function balance() public view returns (uint) {
        return token.balanceOf(address(this));
    }

    function request() public {
        require(
            !withdrewAlready[msg.sender],
            "You have used this faucet already. If you need more tokens, please use another address."
        );
        token.transfer(msg.sender, 10000 ether);
        withdrewAlready[msg.sender] = true;
    }
}
