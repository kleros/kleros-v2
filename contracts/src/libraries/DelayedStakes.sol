// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {KlerosCore} from "../arbitration/KlerosCore.sol";

/// @title DelayedStakes
/// @notice Library for managing delayed stakes in the sortition module
library DelayedStakes {
    struct Stake {
        address account; // The address of the juror.
        uint96 courtID; // The ID of the court.
        uint256 stake; // The new stake.
        bool alreadyTransferred; // DEPRECATED. True if tokens were already transferred before delayed stake's execution.
    }

    struct Queue {
        uint256 writeIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
        uint256 readIndex; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.
        mapping(uint256 => Stake) stakes; // The delayed stakes storage
        mapping(address jurorAccount => mapping(uint96 courtId => uint256)) latestDelayedStakeIndex; // DEPRECATED. Maps the juror to its latest delayed stake.
    }

    /// @notice Initialize the queue
    /// @param queue The queue to initialize
    function initialize(Queue storage queue) internal {
        queue.readIndex = 1; // Skip index 0
    }

    /// @notice Add a new delayed stake to the queue
    /// @param queue The delayed stakes queue
    /// @param account The address of the juror
    /// @param courtID The ID of the court
    /// @param stake The new stake amount
    function add(Queue storage queue, address account, uint96 courtID, uint256 stake) internal {
        uint256 newWriteIndex = ++queue.writeIndex;
        Stake storage delayedStake = queue.stakes[newWriteIndex];
        delayedStake.account = account;
        delayedStake.courtID = courtID;
        delayedStake.stake = stake;
    }

    /// @notice Execute pending delayed stakes
    /// @param queue The delayed stakes queue
    /// @param core The KlerosCore instance
    /// @param iterations The maximum number of stakes to execute
    /// @return success True if there were stakes to execute, false otherwise
    function execute(Queue storage queue, KlerosCore core, uint256 iterations) internal returns (bool success) {
        if (queue.writeIndex < queue.readIndex) {
            return false; // Nothing to execute.
        }

        uint256 actualIterations = calculateIterations(queue.writeIndex, queue.readIndex, iterations);
        uint256 newReadIndex = queue.readIndex + actualIterations;

        for (uint256 i = queue.readIndex; i < newReadIndex; i++) {
            Stake storage delayedStake = queue.stakes[i];
            core.setStakeBySortitionModule(delayedStake.account, delayedStake.courtID, delayedStake.stake);
            delete queue.stakes[i];
        }

        queue.readIndex = newReadIndex;
        return true;
    }

    /// @notice Calculate the actual number of iterations to process
    /// @param writeIndex The current write index
    /// @param readIndex The current read index
    /// @param requestedIterations The requested number of iterations
    /// @return The actual number of iterations that can be processed
    function calculateIterations(
        uint256 writeIndex,
        uint256 readIndex,
        uint256 requestedIterations
    ) internal pure returns (uint256) {
        if (readIndex + requestedIterations - 1 > writeIndex) {
            return writeIndex - readIndex + 1;
        } else {
            return requestedIterations;
        }
    }

    /// @notice Get the number of pending stakes
    /// @param queue The delayed stakes queue
    /// @return The number of stakes waiting to be executed
    function pendingStakesCount(Queue storage queue) internal view returns (uint256) {
        if (queue.writeIndex < queue.readIndex) {
            return 0;
        }
        return queue.writeIndex - queue.readIndex + 1;
    }
}
