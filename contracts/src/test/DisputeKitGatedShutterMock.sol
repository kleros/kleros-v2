// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {DisputeKitGatedShutter} from "../arbitration/dispute-kits/DisputeKitGatedShutter.sol";

/// @title DisputeKitGatedShutterMock
/// DisputeKitGatedShutter with view functions to use in the tests.
contract DisputeKitGatedShutterMock is DisputeKitGatedShutter {
    function extraDataToTokenInfo(
        bytes memory _extraData
    ) public pure returns (address tokenGate, bool isERC1155, uint256 tokenId) {
        (, tokenGate, isERC1155, tokenId) = _extraDataToTokenInfo(_extraData);
    }

    /// @notice TEST ONLY: bypasses governance validation.
    /// @dev May violate invariants. For example, `address(0)` is normally forbidden as a token gate.
    function unsafeAddSupportedErc721Token(uint96 _courtID, address _token) external onlyByOwner {
        if (erc721TokenToIndex[_courtID][_token] == 0) {
            supportedErc721Tokens[_courtID].push(_token);
            erc721TokenToIndex[_courtID][_token] = supportedErc721Tokens[_courtID].length;
        }
    }

    /// @notice TEST ONLY: bypasses governance validation.
    /// @dev May violate invariants. For example, `address(0)` is normally forbidden as a token gate.
    function unsafeAddSupportedErc1155Token(uint96 _courtID, address _token) external onlyByOwner {
        if (erc1155TokenToIndex[_courtID][_token] == 0) {
            supportedErc1155Tokens[_courtID].push(_token);
            erc1155TokenToIndex[_courtID][_token] = supportedErc1155Tokens[_courtID].length;
        }
    }
}
