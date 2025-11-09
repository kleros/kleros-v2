// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {KlerosCore} from "../arbitration/KlerosCore.sol";

/// @title KlerosCoreMock
/// KlerosCore with view functions to use in Foundry tests.
contract KlerosCoreMock is KlerosCore {
    function getCourtChildren(uint256 _courtId) external view returns (uint256[] memory children) {
        children = courts[_courtId].children;
    }

    function extraDataToCourtIDMinJurorsDisputeKit(
        bytes memory _extraData
    ) external view returns (uint96 courtID, uint256 minJurors, uint256 disputeKitID) {
        (courtID, minJurors, disputeKitID) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);
    }
}
