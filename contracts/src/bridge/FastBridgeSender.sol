// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridge.sol";
import "./interfaces/IFastBridgeSender.sol";
import "./interfaces/IFastBridgeReceiver.sol";

contract FastBridgeSender is IFastBridgeSender {
    ISafeBridge safebridge;
    IFastBridgeReceiver fastBridgeReceiver;

    /**
     * The bridgers need to watch for these events and
     * relay the messageHash on the FastBridgeReceiver.
     */
    event OutboxMessage(address target, bytes32 messageHash, bytes messagePreImage);

    constructor(ISafeBridge _safebridge, IFastBridgeReceiver _fastBridgeReceiver) {
        safebridge = _safebridge;
        fastBridgeReceiver = _fastBridgeReceiver;
    }

    /**
     * Sends an arbitrary message from one domain to another
     * via the fast bridge mechanism
     *
     * TODO: probably needs some access control either on the sender side
     * or the receiver side
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The receiving domain encoded message data.
     */
    function sendFast(address _receiver, bytes memory _calldata) external {
        // Encode the receiver address with the function signature + arguments i.e calldata
        bytes memory encodedData = abi.encode(_receiver, _calldata);

        emit OutboxMessage(_receiver, keccak256(encodedData), encodedData);

        // The safe bridge sends the encoded data to the FastBridgeReceiver
        // in order for the FastBridgeReceiver to resolve any potential
        // challenges and then forwards the message to the actual
        // intended recipient encoded in `data`
        // TODO: For this encodedData needs to be wrapped into an
        // IFastBridgeReceiver function.
        // TODO: add access checks for this on the FastBridgeReceiver.
        safebridge.sendCrossDomainMessage(address(fastBridgeReceiver), encodedData);
    }
}
