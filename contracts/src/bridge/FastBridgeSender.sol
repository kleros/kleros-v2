// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz*, @hrishibhat]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridge.sol";
import "./interfaces/IFastBridgeSender.sol";
import "./interfaces/IFastBridgeReceiver.sol";
import "../gateway/interfaces/IForeignGateway.sol"
import "../gateway/HomeGateway.sol"
import "../arbitration/KlerosCore.sol";

contract FastBridgeSender is IFastBridgeSender {
    ISafeBridge public safebridge;
    IFastBridgeReceiver public fastBridgeReceiver;
    address public fastSender;
    address public foreignGateway;
    HomeGateway public homeGateway;
    KlerosCore public core; // The Kleros Core arbitrator
    
    /**
     * The bridgers need to watch for these events and
     * relay the messageHash on the FastBridgeReceiver.
     */
    event OutgoingMessage(address target, bytes32 messageHash, bytes message);

    constructor(ISafeBridge _safebridge, IFastBridgeReceiver _fastBridgeReceiver, KlerosCore _core, address, _foreignGateway, HomeGateway _homeGateway) {
        safebridge = _safebridge;
        fastBridgeReceiver = _fastBridgeReceiver;
        core = _core;
        foreignGateway = _foreignGateway;
        homeGateway = _homeGateway;
    }

    function setFastSender(address _fastSender) external {
        require(fastSender == address(0));
        fastSender = _fastSender;
    }
    


    /**
     * Sends an arbitrary message from one domain to another
     * via the fast bridge mechanism
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The receiving domain encoded message data.
     */
    function sendFast(bytes memory _calldata) external {
        require(msg.sender == fastSender, "Access not allowed: Fast Sender only.");

        // Encode the receiver address with the function signature + arguments i.e calldata
        bytes memory encodedData = abi.encode(foreignGateway, _calldata);

        emit OutgoingMessage(foreignGateway, keccak256(encodedData), encodedData);
    }

    /**
     * Sends an arbitrary message from one domain to another
     * via the safe bridge mechanism, which relies on the chain's native bridge.
     *
     * It is unnecessary during normal operations but essential only in case of challenge.
     *
     * It may require some ETH (or whichever native token) to pay for the bridging cost,
     * depending on the underlying safe bridge.
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The receiving domain encoded message data.
     */
    function sendSafe(uint256 _disputeID) external payable {
        // The safe bridge sends the encoded data to the FastBridgeReceiver
        // in order for the FastBridgeReceiver to resolve any potential
        // challenges and then forwards the message to the actual
        // intended recipient encoded in `data`
        // TODO: For this encodedData needs to be wrapped into an
        // IFastBridgeReceiver function.
        // TODO: add access checks for this on the FastBridgeReceiver.
        // TODO: how much ETH should be provided for bridging? add an ISafeBridge.bridgingCost()


        Dispute storage dispute = core.disputes[_disputeID];
        require(dispute.ruled, "Ruling not requested for execution.");
        

        bytes32 disputeHash = homeGateway.disputeIDtoHash[_disputeID];
        RelayedData memory relayedData = homeGateway.disputeHashtoRelayedData[disputeHash];
        uint256 ruling = core.currentRuling(_disputeID);
        
        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, disputeHash, ruling, relayedData.relayer);
        
        bytes memory encodedData = abi.encode(foreignGateway, data);
        bytes memory encodedTxData = abi.encodeWithSelector(fastBridgeReceiver.relayRule.selector, encodedData);
        safebridge.sendSafe{value: msg.value}(address(fastBridgeReceiver), encodedTxData);
    }
}
