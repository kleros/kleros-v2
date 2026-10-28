// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HomeGateway} from "../../src/gateway/HomeGateway.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {IHomeGateway} from "../../src/gateway/interfaces/IHomeGateway.sol";
import {IArbitratorV2, IArbitrableV2} from "../../src/arbitration/interfaces/IArbitratorV2.sol";
import {YaruMock} from "../../src/gateway/mock/VeashiMocks.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IYaru} from "@kleros/veashi-sdk/contracts/interfaces/IYaru.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {GatewayHarness} from "./gateway/GatewayHarness.sol";
import {VouchingReporter, RevertingReporter, SelfVouchingDispatcher} from "./gateway/Reporters.sol";

// ************************************* //
// *      R1: vouched ruling leg       * //
// ************************************* //

/// @dev `rule` dispatches through `_dispatchVouched`: the gateway's reporters accept its message and refuse any other
/// sender's, and the gateway vouches only during its own dispatch. The ruler calls `rule` from `executeRuling`.
contract HomeGatewayVouchedDispatchTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));
    uint256 internal homeDisputeID;
    bytes32 internal disputeHash;

    function setUp() public override {
        super.setUp();
        (, homeDisputeID, disputeHash) = _disputeOnHome(extraData, _ids(0, 1), 2);
    }

    function test_rule_dispatchesVouchedThroughYaho() public {
        uint256 ruling = 1;
        Message memory expected = Message({
            nonce: homeYaho.currentNonce(),
            targetChainId: block.chainid,
            threshold: 2,
            sender: address(homeGateway),
            receiver: address(foreignGateway),
            data: abi.encode(disputeHash, ruling),
            reporters: _reporters(homeReporters[0], homeReporters[1]),
            adapters: _adapters(foreignAdapters[0], foreignAdapters[1])
        });
        bytes32 messageHash = homeYaho.calculateMessageHash(expected);
        uint256 expectedId = homeYaho.calculateMessageId(block.chainid, address(homeYaho), messageHash);
        assertFalse(homeGateway.isDispatching(messageHash), "vouched before the dispatch");

        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit IHomeGateway.RulingDispatched(homeDisputeID, disputeHash, ruling, expectedId);
        ruler.executeRuling(homeDisputeID, ruling, false, false);

        assertEq(homeYaho.currentNonce(), expected.nonce + 1, "one message dispatched");
        for (uint256 i = 0; i < NB_ORACLES; i++) {
            assertEq(homeReporters[i].dispatchCount(), 1, "dispatch count");
            assertEq(homeReporters[i].lastTargetChainId(), block.chainid, "target chain");
            assertEq(address(homeReporters[i].lastAdapter()), address(foreignAdapters[i]), "adapter");
            _assertReported(homeReporters[i], homeYaho, expectedId, expected);
        }
        assertFalse(homeGateway.isDispatching(messageHash), "vouched after the dispatch");
    }

    function test_directDispatchWithTheGatewayReporters_reverts() public {
        IReporter[] memory reporters = _reporters(homeReporters[0], homeReporters[1]);
        IAdapter[] memory adapters = _adapters(foreignAdapters[0], foreignAdapters[1]);
        bytes memory data = abi.encode(disputeHash, uint256(2));
        Message memory forged = Message(
            homeYaho.currentNonce(),
            block.chainid,
            1,
            other,
            address(foreignGateway),
            data,
            reporters,
            adapters
        );
        bytes32 forgedHash = homeYaho.calculateMessageHash(forged);

        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(VouchingReporter.NotVouched.selector, forgedHash));
        homeYaho.dispatchMessageToAdapters(block.chainid, 1, address(foreignGateway), data, reporters, adapters);
    }

    function test_selfVouchingDispatcher_cannotUseTheGatewayReporters() public {
        SelfVouchingDispatcher attacker = new SelfVouchingDispatcher(address(homeYaho));
        IReporter[] memory reporters = _reporters(homeReporters[0], homeReporters[1]);
        IAdapter[] memory adapters = _adapters(foreignAdapters[0], foreignAdapters[1]);
        bytes memory data = abi.encode(disputeHash, uint256(2));
        Message memory forged = Message(
            homeYaho.currentNonce(),
            block.chainid,
            1,
            address(attacker),
            address(foreignGateway),
            data,
            reporters,
            adapters
        );
        bytes32 forgedHash = homeYaho.calculateMessageHash(forged);

        vm.expectRevert(abi.encodeWithSelector(VouchingReporter.NotVouched.selector, forgedHash));
        attacker.dispatch(block.chainid, 1, address(foreignGateway), data, reporters, adapters);
    }

    function test_isDispatching_falseOutsideADispatch() public {
        (, Message memory message) = _ruleOnHome(homeDisputeID, 1);

        assertFalse(homeGateway.isDispatching(homeYaho.calculateMessageHash(message)), "dispatched hash");
        assertFalse(homeGateway.isDispatching(bytes32(0)), "zero hash");
    }
}

// ************************************* //
// *  R4: replaceable, muted reporters * //
// ************************************* //

/// @dev `setOracleReporter` on the ruling leg. The recovery tests select 2 oracles with a threshold of 1, so the
/// muted oracle's adapter is not needed for delivery.
contract HomeGatewayReporterTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));

    function test_setOracleReporter_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.setOracleReporter(0, IReporter(address(0)));
    }

    function test_setOracleReporter_unknownOracle_reverts() public {
        vm.prank(governor);
        vm.expectRevert(abi.encodeWithSelector(HomeGateway.UnknownOracle.selector, NB_ORACLES));
        homeGateway.setOracleReporter(NB_ORACLES, homeReporters[0]);
    }

    function test_setOracleReporter_setsAndEmits() public {
        IReporter reporter = new VouchingReporter(address(homeYaho));
        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit HomeGateway.OracleReporterSet(1, reporter);
        vm.prank(governor);
        homeGateway.setOracleReporter(1, reporter);

        (IReporter stored, IAdapter outboundAdapter, IAdapter inboundAdapter) = homeGateway.oracles(1);
        assertEq(address(stored), address(reporter), "reporter");
        assertEq(address(outboundAdapter), address(foreignAdapters[1]), "outbound adapter unchanged");
        assertEq(address(inboundAdapter), address(homeAdapters[1]), "inbound adapter unchanged");
    }

    function test_setOracleReporter_acceptsZero() public {
        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit HomeGateway.OracleReporterSet(0, IReporter(address(0)));
        vm.prank(governor);
        homeGateway.setOracleReporter(0, IReporter(address(0)));

        (IReporter stored, , ) = homeGateway.oracles(0);
        assertEq(address(stored), address(0), "reporter");
    }

    /// @dev [O10]: the same function, event and error on both gateways.
    function test_setOracleReporter_sameShapeOnBothGateways() public pure {
        assertEq(HomeGateway.setOracleReporter.selector, ForeignGateway.setOracleReporter.selector, "function");
        assertEq(HomeGateway.OracleReporterSet.selector, ForeignGateway.OracleReporterSet.selector, "event");
        assertEq(HomeGateway.UnknownOracle.selector, ForeignGateway.UnknownOracle.selector, "error");
        assertEq(HomeGateway.setOracleReporter.selector, bytes4(keccak256("setOracleReporter(uint256,address)")));
        assertEq(HomeGateway.OracleReporterSet.selector, keccak256("OracleReporterSet(uint256,address)"));
        assertEq(HomeGateway.UnknownOracle.selector, bytes4(keccak256("UnknownOracle(uint256)")));
    }

    function test_revertingReporter_blocksTheRuling() public {
        (, uint256 homeDisputeID, ) = _disputeOnHome(extraData, _ids(0, 1), 1);
        _breakReporter(0);

        vm.expectRevert(RevertingReporter.ReporterDown.selector);
        ruler.executeRuling(homeDisputeID, 1, false, false);
        (, , , bool ruled) = ruler.disputes(homeDisputeID);
        assertFalse(ruled, "ruled");
    }

    function test_mutedReporter_rulingSucceedsAndTheForeignGatewayAcceptsIt() public {
        (uint256 foreignDisputeID, uint256 homeDisputeID, ) = _disputeOnHome(extraData, _ids(0, 1), 1);
        _breakReporter(0);
        vm.expectRevert(RevertingReporter.ReporterDown.selector);
        ruler.executeRuling(homeDisputeID, 1, false, false);

        vm.prank(governor);
        homeGateway.setOracleReporter(0, IReporter(address(0)));
        (uint256 messageId, Message memory message) = _ruleOnHome(homeDisputeID, 1);

        assertEq(address(message.reporters[0]), address(0), "muted reporter");
        assertEq(address(message.reporters[1]), address(homeReporters[1]), "working reporter");
        assertEq(address(message.adapters[0]), address(foreignAdapters[0]), "muted oracle's adapter kept");
        assertEq(message.threshold, 1, "threshold");
        _assertReported(homeReporters[1], homeYaho, messageId, message);

        _deliver(foreignYaru, homeYaho, messageId, message);
        assertEq(rulingCount, 1, "arbitrable ruled");
        assertEq(lastRuledDisputeID, foreignDisputeID, "foreign dispute ID");
        assertEq(lastRuling, 1, "ruling");
    }

    function test_replacedReporter_isUsed() public {
        (, uint256 homeDisputeID, ) = _disputeOnHome(extraData, _ids(0, 1), 1);
        _breakReporter(0);
        vm.expectRevert(RevertingReporter.ReporterDown.selector);
        ruler.executeRuling(homeDisputeID, 1, false, false);

        VouchingReporter replacement = new VouchingReporter(address(homeYaho));
        replacement.setDispatcher(address(homeGateway));
        vm.prank(governor);
        homeGateway.setOracleReporter(0, replacement);
        (uint256 messageId, Message memory message) = _ruleOnHome(homeDisputeID, 1);

        assertEq(address(message.reporters[0]), address(replacement), "replacement in the message");
        _assertReported(replacement, homeYaho, messageId, message);
        assertEq(replacement.dispatchCount(), 1, "replacement used");
        assertEq(homeReporters[0].dispatchCount(), 0, "replaced reporter unused");
    }

    function _breakReporter(uint256 _oracleID) internal {
        IReporter reporter = new RevertingReporter();
        vm.prank(governor);
        homeGateway.setOracleReporter(_oracleID, reporter);
    }
}

// ************************************* //
// *     Dispute creation failure      * //
// ************************************* //

/// @dev An arbitrator for the creation-failure tests: `arbitrationCost` reverts if `costFails`, and `createDispute`
/// burns `burn` gas in its own frame (KlerosCore with a long extraData) and then reverts if `createFails`.
contract ArbitratorStub {
    uint256 public burn;
    bool public costFails;
    bool public createFails;
    uint256 internal disputeCount;

    function configure(uint256 _burn, bool _costFails, bool _createFails) external {
        burn = _burn;
        costFails = _costFails;
        createFails = _createFails;
    }

    function arbitrationCost(bytes calldata) external view returns (uint256) {
        require(!costFails, "Cost unavailable");
        return 0.01 ether;
    }

    function createDispute(uint256, bytes calldata) external payable returns (uint256 disputeID) {
        uint256 start = gasleft();
        while (start - gasleft() < burn) {}
        require(!createFails, "Dispute rejected");
        disputeID = disputeCount++;
    }
}

/// @dev A Hashi for which every adapter agrees, so a YaruMock executes any message.
contract HashiStub {
    function checkHashWithThresholdFromAdapters(
        uint256,
        uint256,
        uint256,
        IAdapter[] calldata
    ) external pure returns (bool) {
        return true;
    }
}

/// @dev `onMessage` turns a `createDispute` revert, or a balance below the cost, into a creation failure, sent
/// back over the dispute's oracles in the same delivery. A revert of that dispatch reverts the delivery.
contract HomeGatewayCreationFailureTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));

    function _relayed(
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal returns (bytes32 disputeHash, uint256 messageId, Message memory message) {
        uint256 foreignDisputeID = _createDispute(extraData, _oracleIDs, _threshold);
        (messageId, message) = _relay(foreignDisputeID, extraData);
        disputeHash = _disputeHash(foreignDisputeID, extraData);
    }

    function _failed(bytes32 _disputeHash) internal view returns (bool) {
        return homeGateway.getReceivedDispute(_disputeHash).creationFailed;
    }

    /// @dev The creation failure the HomeGateway dispatches next for a dispute on oracles 0 and 1 with a threshold of 2.
    function _nextFailure(bytes32 _disputeHash) internal view returns (uint256 messageId, Message memory message) {
        message = Message({
            nonce: homeYaho.currentNonce(),
            targetChainId: block.chainid,
            threshold: 2,
            sender: address(homeGateway),
            receiver: address(foreignGateway),
            data: abi.encode(_disputeHash),
            reporters: _reporters(homeReporters[0], homeReporters[1]),
            adapters: _adapters(foreignAdapters[0], foreignAdapters[1])
        });
        bytes32 messageHash = homeYaho.calculateMessageHash(message);
        messageId = homeYaho.calculateMessageId(block.chainid, address(homeYaho), messageHash);
    }

    function _useStub(uint256 _burn, bool _costFails, bool _createFails) internal returns (ArbitratorStub stub) {
        stub = new ArbitratorStub();
        stub.configure(_burn, _costFails, _createFails);
        vm.prank(governor);
        homeGateway.changeArbitrator(IArbitratorV2(address(stub)));
    }

    function _breakReporter(uint256 _oracleID) internal returns (IReporter previous) {
        (previous, , ) = homeGateway.oracles(_oracleID);
        IReporter reporter = new RevertingReporter();
        vm.prank(governor);
        homeGateway.setOracleReporter(_oracleID, reporter);
    }

    function test_arbitratorRevert_dispatchesTheFailureOverTheDisputeOracles() public {
        _useStub(0, false, true);
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        uint256 balance = address(homeGateway).balance;
        (uint256 failureId, Message memory failure) = _nextFailure(disputeHash);

        // The whole revert data of `createDispute`, not only its selector.
        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit HomeGateway.DisputeCreationFailed(
            disputeHash,
            abi.encodeWithSignature("Error(string)", "Dispute rejected"),
            failureId
        );
        _deliver(homeYaru, foreignYaho, messageId, message);

        HomeGateway.ReceivedDispute memory receivedDispute = homeGateway.getReceivedDispute(disputeHash);
        assertTrue(receivedDispute.creationFailed, "creation failed");
        assertFalse(receivedDispute.received, "not received");
        assertEq(receivedDispute.oracleIDs, _ids(0, 1), "oracles stored");
        assertEq(receivedDispute.threshold, 2, "threshold stored");
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), 0, "no home dispute ID");
        assertEq(address(homeGateway).balance, balance, "arbitration cost kept");
        assertEq(homeYaho.currentNonce(), failure.nonce + 1, "one message dispatched");
        for (uint256 i = 0; i < NB_ORACLES; i++) {
            assertEq(address(homeReporters[i].lastAdapter()), address(foreignAdapters[i]), "adapter");
            _assertReported(homeReporters[i], homeYaho, failureId, failure);
        }
    }

    /// @dev Only `createDispute` is tried: a revert of `arbitrationCost` reverts the delivery, which stays retryable.
    function test_arbitrationCostRevert_staysRetryable() public {
        ArbitratorStub stub = _useStub(0, true, false);
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        vm.prank(homeYaru);
        vm.expectRevert("Cost unavailable");
        homeGateway.onMessage(messageId, block.chainid, message.sender, 1, message.adapters, message.data);
        assertFalse(_failed(disputeHash), "no failure recorded");
        assertEq(homeGateway.getReceivedDispute(disputeHash).oracleIDs.length, 0, "nothing stored");

        stub.configure(0, false, false);
        _deliver(homeYaru, foreignYaho, messageId, message);
        assertTrue(homeGateway.getReceivedDispute(disputeHash).received, "created on retry");
        assertFalse(_failed(disputeHash), "no failure on retry");
    }

    /// @dev No waiting for a top-up: a balance below the cost is a failure, and the balance is untouched.
    function test_insufficientBalance_isACreationFailure() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        uint256 cost = ruler.arbitrationCost(extraData);
        vm.deal(address(homeGateway), cost - 1);
        uint256 nextHomeDisputeID = ruler.getNextDisputeID();
        (uint256 failureId, ) = _nextFailure(disputeHash);

        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit HomeGateway.DisputeCreationFailed(
            disputeHash,
            abi.encodeWithSelector(HomeGateway.InsufficientFunds.selector, cost, cost - 1),
            failureId
        );
        _deliver(homeYaru, foreignYaho, messageId, message);

        assertTrue(_failed(disputeHash), "creation failed");
        assertEq(ruler.getNextDisputeID(), nextHomeDisputeID, "no dispute on the ruler");
        assertEq(address(homeGateway).balance, cost - 1, "balance untouched");
    }

    /// @dev A failed dispute is never created again, and has no home dispute ID to rule.
    function test_failedDispute_redeliveryAndRuleRevert() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        _breakRuler();
        _deliver(homeYaru, foreignYaho, messageId, message);
        ruler.changeRulingModeToManual(IArbitrableV2(address(homeGateway)));
        uint256 homeDisputeID = homeGateway.disputeHashToHomeID(disputeHash);

        // As a new Yaru would after `changeYaru`: the first one marked the message executed.
        vm.prank(homeYaru);
        vm.expectRevert(HomeGateway.DisputeAlreadyReceived.selector);
        homeGateway.onMessage(messageId, block.chainid, message.sender, 1, message.adapters, message.data);

        vm.prank(address(ruler));
        vm.expectRevert(HomeGateway.DisputeDoesNotExist.selector);
        homeGateway.rule(homeDisputeID, 1);
    }

    /// @dev A created dispute sends nothing back: Yaho dispatches only its ruling.
    function test_createdDispute_dispatchesNoFailure() public {
        uint256 nonce = homeYaho.currentNonce();
        (, uint256 homeDisputeID, bytes32 disputeHash) = _disputeOnHome(extraData, _ids(0, 1), 2);
        assertTrue(homeGateway.getReceivedDispute(disputeHash).received, "received");
        assertFalse(_failed(disputeHash), "no failure recorded");
        assertEq(homeYaho.currentNonce(), nonce, "nothing dispatched");

        _ruleOnHome(homeDisputeID, 1);
        assertEq(homeYaho.currentNonce(), nonce + 1, "only the ruling dispatched");
    }

    /// @dev A failure dispatch that reverts (a reporter is down) reverts the delivery, so Yaru keeps the message
    /// executable, nothing recorded or dispatched. Once the governor replaced the reporter, Yaru executes it again.
    function test_failureDispatchReverts_revertsTheDelivery_thenYaruExecutesItAgain() public {
        YaruMock yaru = new YaruMock(address(new HashiStub()), address(foreignYaho), block.chainid);
        vm.prank(governor);
        homeGateway.changeYaru(address(yaru));
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        _breakRuler();
        IReporter working = _breakReporter(1);
        Message[] memory messages = new Message[](1);
        messages[0] = message;
        uint256 nonce = homeYaho.currentNonce();

        vm.expectRevert(IYaru.CallFailed.selector);
        yaru.executeMessages(messages);
        assertFalse(yaru.executed(messageId), "still executable");
        assertFalse(_failed(disputeHash), "no failure recorded");
        assertEq(homeGateway.getReceivedDispute(disputeHash).oracleIDs.length, 0, "nothing stored");
        assertEq(homeYaho.currentNonce(), nonce, "nothing dispatched");
        assertEq(homeReporters[0].dispatchCount(), 0, "working reporter rolled back");

        vm.prank(governor);
        homeGateway.setOracleReporter(1, working);
        (uint256 failureId, Message memory failure) = _nextFailure(disputeHash);
        yaru.executeMessages(messages);

        assertTrue(yaru.executed(messageId), "executed");
        assertTrue(_failed(disputeHash), "creation failed");
        assertEq(homeYaho.currentNonce(), nonce + 1, "failure dispatched");
        for (uint256 i = 0; i < NB_ORACLES; i++) _assertReported(homeReporters[i], homeYaho, failureId, failure);
    }

    /// @dev Gas guard on `createDispute`. The arbitrator needs ~9M gas and then creates the dispute (KlerosCore with
    /// ~12 KB of extraData), and the oracle's reporter is muted, so a failure would be sent cheaply. An executor giving
    /// less gas starves `createDispute` and still keeps 1/64 of it for the failure path: without the guard, each
    /// `InsufficientGas` below would be a forged failure. No gas limit records one.
    function test_underGassedDelivery_neverRecordsAFailure() public {
        _useStub(9_000_000, false, false);
        vm.prank(governor);
        homeGateway.setOracleReporter(0, IReporter(address(0)));
        (bytes32 disputeHash, , Message memory message) = _relayed(_ids(0), 1);

        uint256 guardHits;
        bool created;
        for (uint256 gasLimit = 6_000_000; gasLimit < 9_600_000 && !created; gasLimit += 50_000) {
            vm.prank(homeYaru);
            try
                homeGateway.onMessage{gas: gasLimit}(
                    0,
                    block.chainid,
                    message.sender,
                    1,
                    message.adapters,
                    message.data
                )
            {
                created = true;
            } catch (bytes memory reason) {
                if (bytes4(reason) == HomeGateway.InsufficientGas.selector) guardHits++;
            }
            assertFalse(_failed(disputeHash), "no failure recorded");
        }
        assertTrue(created && homeGateway.getReceivedDispute(disputeHash).received, "created with enough gas");
        assertGt(guardHits, 0, "guard hit");
    }
}
