// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

interface IERC677 {
    function transfer(address _to, uint256 _value) external returns (bool);

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);

    function approve(address _spender, uint256 _value) external returns (bool);
}
