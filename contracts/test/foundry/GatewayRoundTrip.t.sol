// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HomeGateway} from "../../src/gateway/HomeGateway.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {IForeignGateway} from "../../src/gateway/interfaces/IForeignGateway.sol";
import {GatewayLightbulb} from "../../src/gateway/mock/GatewayLightbulb.sol";
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

    /// @dev The ruler rejects the dispute: the failure comes back over the dispute's oracles, the arbitrable
    /// is called back instead of ruled, and claims the juror fees it paid.
    function test_roundTrip_creationFailure() public {
        bytes memory extraData = abi.encode(uint256(MIRRORED_COURT), uint256(5));
        _breakRuler();
        uint256 homeBalance = address(homeGateway).balance;

        (uint256 foreignDisputeID, bytes32 disputeHash, uint256 messageId, Message memory message) = _failOnHome(
            extraData,
            _ids(0, 1),
            2
        );
        assertEq(address(homeGateway).balance, homeBalance, "nothing paid on the home chain");
        assertEq(message.sender, address(homeGateway), "failure sender");
        assertEq(message.receiver, address(foreignGateway), "failure receiver");
        assertEq(message.threshold, 2, "failure threshold");
        assertEq(message.data, abi.encode(disputeHash), "failure data");
        for (uint256 i = 0; i < NB_ORACLES; i++) {
            assertEq(address(message.adapters[i]), address(foreignAdapters[i]), "failure adapter");
            _assertReported(homeReporters[i], homeYaho, messageId, message);
        }

        _deliver(foreignYaru, homeYaho, messageId, message);
        assertEq(creationFailureCount, 1, "called back");
        assertEq(lastFailedDisputeID, foreignDisputeID, "failed dispute");
        assertEq(rulingCount, 0, "not ruled");

        (, , , , , uint256 feesForJurors, ) = foreignGateway.disputeHashtoDisputeData(disputeHash);
        address beneficiary = makeAddr("beneficiary");
        foreignGateway.claimRefund(foreignDisputeID, beneficiary);
        assertEq(beneficiary.balance, feesForJurors, "juror fees refunded");
    }

    /// @dev The same with the GatewayLightbulb mock: the request is closed without switching the bulb, and anyone can
    /// claim the juror fees for its owner.
    function test_roundTrip_creationFailure_lightbulb() public {
        bytes memory extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));
        GatewayLightbulb lightbulb = new GatewayLightbulb(IForeignGateway(address(foreignGateway)), extraData, 0, "");
        address owner = makeAddr("owner");
        vm.deal(owner, 1 ether);
        uint256 cost = foreignGateway.arbitrationCost(extraData);
        vm.recordLogs();
        vm.prank(owner);
        uint256 disputeID = lightbulb.requestSwitch{value: cost}();
        (uint256 disputeMessageId, Message memory disputeMessage) = _dispatchedMessage(foreignYaho);

        _breakRuler();
        vm.recordLogs();
        _deliver(homeYaru, foreignYaho, disputeMessageId, disputeMessage);
        (uint256 failureId, Message memory failure) = _dispatchedMessage(homeYaho);
        vm.expectEmit(true, true, true, true, address(lightbulb));
        emit GatewayLightbulb.LightbulbRequestFailed(owner, disputeID);
        _deliver(foreignYaru, homeYaho, failureId, failure);

        (address requestOwner, bool ruled, uint256 ruling) = lightbulb.requests(disputeID);
        assertEq(requestOwner, owner, "owner");
        assertTrue(ruled, "request closed");
        assertEq(ruling, 0, "no ruling");
        assertFalse(lightbulb.lightbulbIsOn(owner), "bulb not switched");

        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                "createDispute",
                block.chainid,
                address(foreignGateway),
                address(lightbulb),
                disputeID,
                lightbulb.NUMBER_OF_CHOICES(),
                extraData
            )
        );
        (, , , , , uint256 feesForJurors, ) = foreignGateway.disputeHashtoDisputeData(disputeHash);
        uint256 ownerBalance = owner.balance;
        vm.prank(other);
        lightbulb.claimRefund(disputeID);
        assertEq(owner.balance, ownerBalance + feesForJurors, "owner refunded");
        vm.expectRevert(ForeignGateway.NoRefundPending.selector);
        lightbulb.claimRefund(disputeID);
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
