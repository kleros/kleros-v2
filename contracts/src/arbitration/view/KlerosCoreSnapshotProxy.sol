// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

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
    address public owner;
    string public constant name = "Staked Pinakion";
    string public constant symbol = "stPNK";
    uint8 public constant decimals = 18;

    // ************************************* //
    // *         Modifiers                 * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    // ************************************* //
    // *         Constructor               * //
    // ************************************* //

    /// @notice Constructor
    /// @param _owner The owner of the contract.
    /// @param _core KlerosCore to read the balance from.
    constructor(address _owner, IKlerosCore _core) {
        owner = _owner;
        core = _core;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the `core` storage variable.
    /// @param _core The new value for the `core` storage variable.
    function changeCore(IKlerosCore _core) external onlyByOwner {
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
        (totalStaked, , , ) = core.sortitionModule().getJurorBalance(_account, 0);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
}
