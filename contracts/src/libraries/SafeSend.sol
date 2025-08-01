/**
 * @authors: [@andreimvp]
 * @reviewers: [@divyangchauhan, @wadader, @fcanela, @unknownunknown1]
 * @auditors: []
 * @bounties: []
 * SPDX-License-Identifier: MIT
 */

pragma solidity ^0.8.24;

interface WethLike {
    function deposit() external payable;

    function transfer(address dst, uint256 wad) external;
}

library SafeSend {
    function safeSend(address payable _to, uint256 _value, address _wethLike) internal {
        if (_to.send(_value)) return;

        WethLike(_wethLike).deposit{value: _value}();
        WethLike(_wethLike).transfer(_to, _value);
    }
}
