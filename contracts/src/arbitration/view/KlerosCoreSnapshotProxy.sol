// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ISortitionModule} from "../interfaces/ISortitionModule.sol";

interface IKlerosCore {
    function sortitionModule() external view returns (ISortitionModule);
}

/// @title KlerosCoreSnapshotProxy
/// Proxy contract for V2 that exposes staked PNK with balanceOf() function for Snapshot voting.
contract KlerosCoreSnapshotProxy {
    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    IKlerosCore public core;
    address public governor;
    string public constant name = "Staked Pinakion";
    string public constant symbol = "stPNK";
    uint8 public constant decimals = 18;

    // ************************************* //
    // *         Modifiers                 * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    // ************************************* //
    // *         Constructor               * //
    // ************************************* //

    /// @dev Constructor
    /// @param _governor The governor of the contract.
    /// @param _core KlerosCore to read the balance from.
    constructor(address _governor, IKlerosCore _core) {
        governor = _governor;
        core = _core;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Changes the `governor` storage variable.
    /// @param _governor The new value for the `governor` storage variable.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the `core` storage variable.
    /// @param _core The new value for the `core` storage variable.
    function changeCore(IKlerosCore _core) external onlyByGovernor {
        core = _core;
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Returns the amount of PNK staked in KlerosV2 for a particular address.
    /// Note: Proxy doesn't need to differentiate between courts so we pass 0 as courtID.
    /// @param _account The address to query.
    /// @return totalStaked Total amount staked in V2 by the address.
    function balanceOf(address _account) external view returns (uint256 totalStaked) {
        (totalStaked, , , ) = core.sortitionModule().getJurorBalance(_account, 0);
    }
}
