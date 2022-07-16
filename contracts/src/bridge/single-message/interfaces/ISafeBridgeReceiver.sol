// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract ISafeBridgeReceiver {
    function isSentBySafeBridge() internal view virtual returns (bool);
}
