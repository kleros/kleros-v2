// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedPinakionV2 is ERC20 {
    constructor() ERC20("Staking PNK on xDai", "stPNK") {
        _mint(msg.sender, 1000000 ether);
    }
}
