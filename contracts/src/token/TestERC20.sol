// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor(string memory _name, string memory _symbol, address _deployer) ERC20(_name, _symbol) {
        _mint(_deployer, 1000000 ether);
    }
}
