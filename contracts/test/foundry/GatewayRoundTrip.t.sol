// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HomeGateway} from "../../src/gateway/HomeGateway.sol";
import {IArbitrableV2} from "../../src/arbitration/interfaces/IArbitrableV2.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {GatewayHarness} from "./gateway/GatewayHarness.sol";
import "../../src/libraries/Constants.sol";

/// @dev A dispute and its ruling across both gateways: FG `createDispute` + `relayDispute` → (Yaru) HG `onMessage`
/// creates it on KlerosCoreRuler → the ruler rules → HG `rule` → (Yaru) FG `onMessage` rules the arbitrable.
/// Both legs are dispatched through a real SDK Yaho to vouching reporters, and delivered with the dispatched
/// message's own sender, threshold and adapters.
contract GatewayRoundTripTest is GatewayHarness {
    function test_roundTrip_selectedOracles() public {
        _roundTrip(abi.encode(uint256(MIRRORED_COURT), uint256(5)), false);
    }

    function test_roundTrip_defaultSelection() public {
        _roundTrip("", true);
    }

    function _roundTrip(bytes memory _extraData, bool _defaultSelection) internal {
        uint256[] memory oracleIDs = _defaultSelection ? _ids(0) : _ids(0, 1);
        uint256 threshold = _defaultSelection ? 1 : 2;
        uint256 rulerCost = ruler.arbitrationCost(_extraData);

        // Foreign chain: the arbitrable pays the ruler's cost (no bridging cost is set) and relays the dispute.
        uint256 foreignDisputeID = _defaultSelection
            ? foreignGateway.createDispute{value: foreignGateway.arbitrationCost(_extraData)}(CHOICES, _extraData)
            : _createDispute(_extraData, oracleIDs, threshold);
        bytes32 disputeHash = _disputeHash(foreignDisputeID, _extraData);
        (, , , , , uint256 feesForJurors, ) = foreignGateway.disputeHashtoDisputeData(disputeHash);
        assertEq(feesForJurors, rulerCost, "foreign juror fees");

        (uint256 disputeMessageId, Message memory disputeMessage) = _relay(foreignDisputeID, _extraData);
        assertEq(disputeMessage.sender, address(foreignGateway), "dispute sender");
        assertEq(disputeMessage.receiver, address(homeGateway), "dispute receiver");
        assertEq(disputeMessage.threshold, threshold, "dispute threshold");
        assertEq(disputeMessage.adapters.length, oracleIDs.length, "dispute adapters");
        for (uint256 i = 0; i < oracleIDs.length; i++) {
            assertEq(address(disputeMessage.adapters[i]), address(homeAdapters[i]), "dispute adapter");
            _assertReported(foreignReporters[i], foreignYaho, disputeMessageId, disputeMessage);
        }

        // Home chain: Yaru delivers it, the HomeGateway pays the ruler and records the dispute under the same hash.
        uint256 homeDisputeID = ruler.getNextDisputeID();
        uint256 homeBalance = address(homeGateway).balance;
        _deliver(homeYaru, foreignYaho, disputeMessageId, disputeMessage);

        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "home dispute ID");
        assertEq(homeGateway.disputeIDtoHash(homeDisputeID), disputeHash, "dispute hash");
        assertEq(address(homeGateway).balance, homeBalance - rulerCost, "arbitration cost paid");
        (uint96 courtID, IArbitrableV2 arbitrated, , bool ruled) = ruler.disputes(homeDisputeID);
        assertEq(courtID, _defaultSelection ? GENERAL_COURT : MIRRORED_COURT, "court");
        assertEq(address(arbitrated), address(homeGateway), "arbitrated");
        assertFalse(ruled, "ruled on creation");
        HomeGateway.ReceivedDispute memory received = homeGateway.getReceivedDispute(disputeHash);
        assertTrue(received.received, "received");
        assertEq(received.oracleIDs, oracleIDs, "received oracles");
        assertEq(received.threshold, threshold, "received threshold");

        // Ruling leg: the ruler rules, the HomeGateway dispatches the ruling over the same oracles.
        uint256 ruling = 2;
        (uint256 rulingMessageId, Message memory rulingMessage) = _ruleOnHome(homeDisputeID, ruling);
        assertEq(rulingMessage.sender, address(homeGateway), "ruling sender");
        assertEq(rulingMessage.receiver, address(foreignGateway), "ruling receiver");
        assertEq(rulingMessage.threshold, threshold, "ruling threshold");
        assertEq(rulingMessage.data, abi.encode(disputeHash, ruling), "ruling data");
        for (uint256 i = 0; i < oracleIDs.length; i++) {
            assertEq(address(rulingMessage.adapters[i]), address(foreignAdapters[i]), "ruling adapter");
            _assertReported(homeReporters[i], homeYaho, rulingMessageId, rulingMessage);
        }

        // Foreign chain: Yaru delivers the ruling, the ForeignGateway rules the arbitrable.
        _deliver(foreignYaru, homeYaho, rulingMessageId, rulingMessage);
        assertEq(rulingCount, 1, "rulings received");
        assertEq(lastRuledDisputeID, foreignDisputeID, "ruled dispute");
        assertEq(lastRuling, ruling, "ruling");
        (, bool ruledOnForeign, , bool relayed, , , ) = foreignGateway.disputeHashtoDisputeData(disputeHash);
        assertTrue(ruledOnForeign, "ruled on the foreign chain");
        assertTrue(relayed, "relayed");
    }
}
