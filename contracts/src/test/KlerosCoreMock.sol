// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {KlerosCore} from "../arbitration/KlerosCore.sol";

/// @title KlerosCoreMock
/// KlerosCore with view functions to use in Foundry tests.
contract KlerosCoreMock is KlerosCore {
    function getLatestCourtID() external view returns (uint96) {
        return uint96(courts.length - 1);
    }

    function extraDataToCourtIDMinJurorsDisputeKit(
        bytes memory _extraData
    ) external view returns (uint96 courtID, uint256 minJurors, uint256 disputeKitID) {
        (courtID, minJurors, disputeKitID) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);
    }
}
