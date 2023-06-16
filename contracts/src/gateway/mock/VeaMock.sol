// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@kleros/vea-contracts/src/interfaces/inboxes/IVeaInbox.sol";
import "@kleros/vea-contracts/src/interfaces/outboxes/IVeaOutboxOnL1.sol";

contract VeaMock is IVeaOutboxOnL1, IVeaInbox {
    /* solhint-disable */

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @dev Sends an arbitrary message to receiving chain.
    /// Note: Calls authenticated by receiving gateway checking the sender argument.
    /// @param _to The cross-domain contract address which receives the calldata.
    /// @param _fnSelector The function selector of the receiving contract.
    /// @param _data The message calldata, abi.encode(...)
    /// @return msgId The index of the message in the inbox, as a message Id, needed to relay the message.
    function sendMessage(address _to, bytes4 _fnSelector, bytes memory _data) external returns (uint64 msgId) {
        bytes memory data = abi.encodePacked( // abi.encodeWithSelector(fnSelector, msg.sender, data)
            _fnSelector,
            bytes32(uint256(uint160(msg.sender))), // big endian padded encoding of msg.sender, simulating abi.encodeWithSelector
            _data
        );

        (bool success, bytes memory res) = _to.call(data);
        require(success, "Call failure");
    }

    /// @dev Snapshots can be saved a maximum of once per epoch.
    ///      Saves snapshot of state root.
    ///      `O(log(count))` where count number of messages in the inbox.
    function saveSnapshot() external {
        revert("Not Implemented");
    }

    /// @dev Verifies and relays the message.
    /// Note: Gateways expect first argument of message call to be the arbitrum message sender, used for authentication.
    /// @param _proof The merkle proof to prove the message.
    /// @param _msgId The zero based index of the message in the inbox.
    /// @param _to The address to send the message to.
    /// @param _message The message to relay.
    function sendMessage(bytes32[] calldata _proof, uint64 _msgId, address _to, bytes calldata _message) external {
        revert("Not Implemented");
    }

    /// @dev Resolves any challenge of the optimistic claim for 'epoch' using the canonical bridge.
    /// Note: Access restricted to canonical bridge.
    /// @param _epoch The epoch to verify.
    /// @param _stateRoot The true state root for the epoch.
    /// @param _claim The claim associated with the epoch.
    function resolveDisputedClaim(uint256 _epoch, bytes32 _stateRoot, Claim memory _claim) external {
        revert("Not Implemented");
    }

    /* solhint-enable */
}
