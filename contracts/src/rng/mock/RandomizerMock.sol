// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "../RandomizerRNG.sol";

contract RandomizerMock is IRandomizer {
    uint256 private id = 1;

    function request(uint256 callbackGasLimit) external override returns (uint256) {
        return id++;
    }

    function clientWithdrawTo(address _to, uint256 _amount) external override {
        revert("Not Implemented");
    }

    function relay(RandomizerRNG _rng, uint256 _id, bytes32 _value) external {
        _rng.randomizerCallback(_id, _value);
    }
}
