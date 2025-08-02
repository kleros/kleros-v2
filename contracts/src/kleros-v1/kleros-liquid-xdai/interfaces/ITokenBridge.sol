// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./IERC677.sol";

interface ITokenBridge {
    function relayTokens(IERC677 token, address _receiver, uint256 _value) external;
}
