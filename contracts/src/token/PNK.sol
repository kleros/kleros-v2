// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PNK is ERC20 {
    constructor() ERC20("Pinakion", "PNK") {
        _mint(msg.sender, 1000000 ether);
    }
}
