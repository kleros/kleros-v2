// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitGatedShutter} from "../arbitration/dispute-kits/DisputeKitGatedShutter.sol";

/// @title DisputeKitGatedShutterMock
/// DisputeKitGatedShutter with view functions to use in the tests.
contract DisputeKitGatedShutterMock is DisputeKitGatedShutter {
    function extraDataToTokenInfo(
        bytes memory _extraData
    ) public pure returns (address tokenGate, bool isERC1155, uint256 tokenId) {
        (tokenGate, isERC1155, tokenId) = _extraDataToTokenInfo(_extraData);
    }
}
