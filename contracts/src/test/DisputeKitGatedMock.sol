// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {DisputeKitGated} from "../arbitration/dispute-kits/DisputeKitGated.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title DisputeKitGatedMock
/// DisputeKitGated with view functions to use in the tests.
contract DisputeKitGatedMock is DisputeKitGated {
    using EnumerableSet for EnumerableSet.AddressSet;

    function extraDataToTokenInfo(
        bytes memory _extraData
    ) public pure returns (address tokenGate, bool isERC1155, uint256 tokenId) {
        (, tokenGate, isERC1155, tokenId) = _extraDataToTokenInfo(_extraData);
    }

    /// @notice TEST ONLY: bypasses governance validation.
    /// @dev May violate invariants. For example, `address(0)` is normally forbidden as a token gate.
    function unsafeAddSupportedErc721Token(uint96 _courtID, address _token) external onlyByOwner {
        supportedErc721Tokens[_courtID].add(_token);
    }

    /// @notice TEST ONLY: bypasses governance validation.
    /// @dev May violate invariants. For example, `address(0)` is normally forbidden as a token gate.
    function unsafeAddSupportedErc1155Token(uint96 _courtID, address _token) external onlyByOwner {
        supportedErc1155Tokens[_courtID].add(_token);
    }
}
