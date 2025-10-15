// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "../arbitration/dispute-kits/DisputeKitGated.sol";

/// @title DisputeKitGatedMock
/// DisputeKitGated with view functions to use in the tests.
contract DisputeKitGatedMock is DisputeKitGated {
    function extraDataToTokenInfo(
        bytes memory _extraData
    ) public pure returns (address tokenGate, bool isERC1155, uint256 tokenId) {
        (tokenGate, isERC1155, tokenId) = _extraDataToTokenInfo(_extraData);
    }
}
