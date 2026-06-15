// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

/// @title ISlashDestination
/// @notice Abstracts where slashed PNK goes when a staked/escrowed holder fails to reveal in a
///         forking round (G-8). The baseline implementation absorbs the slash into the main-fork
///         redistribution; an alternative routes it to the governor. Q-006 in the open-questions
///         register is resolved by swapping the implementation, not by changing settlement logic.
interface ISlashDestination {
    /// @notice Receives `_amount` of slashed PNK belonging to `_account` for dispute `_coreDisputeID`.
    /// @param _coreDisputeID The forking dispute the slash relates to.
    /// @param _account The slashed holder.
    /// @param _amount The slashed amount.
    function receiveSlash(uint256 _coreDisputeID, address _account, uint256 _amount) external;
}
