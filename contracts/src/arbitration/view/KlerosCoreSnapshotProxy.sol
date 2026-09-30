// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {ISortitionModule} from "../interfaces/ISortitionModule.sol";

interface IKlerosCore {
    function sortitionModule() external view returns (ISortitionModule);
}

/// @title KlerosCoreSnapshotProxy
/// @notice Proxy contract for V2 that exposes staked PNK with balanceOf() function for Snapshot voting.
contract KlerosCoreSnapshotProxy {
    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    IKlerosCore public core;
    string public constant name = "Staked Pinakion";
    string public constant symbol = "stPNK";
    uint8 public constant decimals = 18;

    // ************************************* //
    // *         Constructor               * //
    // ************************************* //

    /// @notice Constructor
    /// @param _core KlerosCore to read the balance from.
    constructor(IKlerosCore _core) {
        core = _core;
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Returns the amount of PNK staked in KlerosV2 for a particular address.
    /// @dev Proxy doesn't need to differentiate between courts so we pass 0 as courtID.
    /// @param _account The address to query.
    /// @return totalStaked Total amount staked in V2 by the address.
    function balanceOf(address _account) external view returns (uint256 totalStaked) {
        (totalStaked, ) = core.sortitionModule().getJurorBalance(_account);
    }
}
