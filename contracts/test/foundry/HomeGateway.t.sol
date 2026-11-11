// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HomeGateway} from "../../src/gateway/HomeGateway.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {IHomeGateway} from "../../src/gateway/interfaces/IHomeGateway.sol";
import {IArbitratorV2, IArbitrableV2} from "../../src/arbitration/interfaces/IArbitratorV2.sol";
import {YaruMock} from "../../src/gateway/mock/VeashiMocks.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IForeignGateway} from "../../src/gateway/interfaces/IForeignGateway.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {GatewayHarness} from "./gateway/GatewayHarness.sol";
import {VouchingReporter, RevertingReporter, ReenteringReporter, SelfVouchingDispatcher} from "./gateway/Reporters.sol";

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
        _executeRuling(foreignDisputeID);
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
// *  Dispute creation, after delivery * //
// ************************************* //

/// @dev An arbitrator for the creation tests: `arbitrationCost` reverts if `costFails`, and `createDispute` burns
/// `burn` gas, makes the `reentry` call back to its caller once if set, and then reverts if `createFails`.
contract ArbitratorStub {
    uint256 public burn;
    bool public costFails;
    bool public createFails;
    bytes public reentry;
    bool public reentrySucceeded;
    bytes public reentryResult;
    uint256 public disputeCount;
    uint256 public lastChoices;
    bytes public lastExtraData;

    function configure(uint256 _burn, bool _costFails, bool _createFails) external {
        burn = _burn;
        costFails = _costFails;
        createFails = _createFails;
    }

    function setReentry(bytes calldata _reentry) external {
        reentry = _reentry;
    }

    function arbitrationCost(bytes calldata) external view returns (uint256) {
        require(!costFails, "Cost unavailable");
        return 0.01 ether;
    }

    function createDispute(uint256 _choices, bytes calldata _extraData) external payable returns (uint256 disputeID) {
        lastChoices = _choices;
        lastExtraData = _extraData;
        uint256 start = gasleft();
        while (start - gasleft() < burn) {}
        if (reentry.length > 0) {
            bytes memory reentryCall = reentry;
            delete reentry;
            (reentrySucceeded, reentryResult) = msg.sender.call(reentryCall);
        }
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

/// @dev `onMessage` only records a dispute. Anyone then creates it with `createReceivedDispute`, which calls the
/// arbitrator with no try, or closes it with `sendCreationFailure` once `creationTimeout` has passed without it being
/// created. Neither one takes the gas a caller gives into account.
contract HomeGatewayCreationTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));

    event CreationTimeoutChanged(uint256 _creationTimeout);

    function _relayed(
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal returns (bytes32 disputeHash, uint256 messageId, Message memory message) {
        uint256 foreignDisputeID = _createDispute(extraData, _oracleIDs, _threshold);
        (messageId, message) = _relay(foreignDisputeID, extraData);
        disputeHash = _disputeHash(foreignDisputeID, extraData);
    }

    /// @dev Creates, relays and delivers a dispute. Returns its hash and the delivered dispute message.
    function _delivered(
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal returns (bytes32 disputeHash, bytes memory data) {
        uint256 messageId;
        Message memory message;
        (disputeHash, messageId, message) = _relayed(_oracleIDs, _threshold);
        _deliver(homeYaru, foreignYaho, messageId, message);
        data = message.data;
    }

    function _decoded(bytes memory _data) internal pure returns (IForeignGateway.DisputeMessage memory) {
        return abi.decode(_data, (IForeignGateway.DisputeMessage));
    }

    /// @dev Received, neither created nor failed, with no home dispute ID.
    function _assertStillReceived(bytes32 _disputeHash) internal view {
        HomeGateway.ReceivedDispute memory receivedDispute = homeGateway.getReceivedDispute(_disputeHash);
        assertGt(receivedDispute.receivedAt, 0, "received");
        assertFalse(receivedDispute.created, "not created");
        assertFalse(receivedDispute.creationFailed, "not failed");
        assertEq(homeGateway.disputeHashToHomeID(_disputeHash), 0, "no home dispute ID");
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

    // ************************************* //
    // *            Delivery               * //
    // ************************************* //

    /// @dev The delivery records the dispute, its selection and its message hash, and emits the message, without
    /// calling the arbitrator, here one whose every call reverts: nothing is paid or dispatched.
    function test_onMessage_recordsTheDispute_withoutCallingTheArbitrator() public {
        _useStub(0, true, true);
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        uint256 balance = address(homeGateway).balance;
        uint256 nonce = homeYaho.currentNonce();

        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit HomeGateway.DisputeReceived(disputeHash, _decoded(message.data));
        _deliver(homeYaru, foreignYaho, messageId, message);

        HomeGateway.ReceivedDispute memory receivedDispute = homeGateway.getReceivedDispute(disputeHash);
        assertEq(receivedDispute.receivedAt, block.timestamp, "received now");
        assertEq(receivedDispute.messageHash, keccak256(message.data), "message hash");
        assertEq(receivedDispute.oracleIDs, _ids(0, 1), "oracles stored");
        assertEq(receivedDispute.threshold, 2, "threshold stored");
        _assertStillReceived(disputeHash);
        assertEq(address(homeGateway).balance, balance, "nothing paid");
        assertEq(homeYaho.currentNonce(), nonce, "nothing dispatched");
    }

    /// @dev Yaru executes the delivery, and marks it executed, even when the arbitrator rejects the dispute: the
    /// message is used once, and the dispute waits in the gateway.
    function test_yaruExecutesTheDelivery_whenTheArbitratorRejectsTheDispute() public {
        _useStub(0, false, true);
        YaruMock yaru = new YaruMock(address(new HashiStub()), address(foreignYaho), block.chainid);
        vm.prank(governor);
        homeGateway.changeYaru(address(yaru));
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        Message[] memory messages = new Message[](1);
        messages[0] = message;

        yaru.executeMessages(messages);
        assertTrue(yaru.executed(messageId), "executed");
        _assertStillReceived(disputeHash);
    }

    // ************************************* //
    // *            Creation               * //
    // ************************************* //

    /// @dev A revert of the arbitrator reverts the call with its own data: nothing is recorded, paid or dispatched,
    /// and anyone creates the dispute once the arbitrator accepts it.
    function test_createReceivedDispute_arbitratorRevert_staysReceived() public {
        ArbitratorStub stub = _useStub(0, false, true);
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0, 1), 2);
        uint256 balance = address(homeGateway).balance;
        uint256 nonce = homeYaho.currentNonce();

        vm.prank(other);
        vm.expectRevert("Dispute rejected");
        homeGateway.createReceivedDispute(_decoded(data));
        _assertStillReceived(disputeHash);
        assertEq(address(homeGateway).balance, balance, "nothing paid");
        assertEq(homeYaho.currentNonce(), nonce, "nothing dispatched");

        stub.configure(0, false, false);
        vm.prank(other);
        uint256 homeDisputeID = homeGateway.createReceivedDispute(_decoded(data));
        assertTrue(homeGateway.getReceivedDispute(disputeHash).created, "created on retry");
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "home dispute ID");
        assertEq(homeGateway.disputeIDtoHash(homeDisputeID), disputeHash, "dispute hash");
        assertEq(address(homeGateway).balance, balance - 0.01 ether, "arbitration cost paid");
        assertEq(stub.lastChoices(), CHOICES, "choices passed");
        assertEq(stub.lastExtraData(), extraData, "extraData passed");
    }

    function test_createReceivedDispute_arbitrationCostRevert_staysReceived() public {
        ArbitratorStub stub = _useStub(0, true, false);
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0), 1);
        vm.expectRevert("Cost unavailable");
        homeGateway.createReceivedDispute(_decoded(data));
        _assertStillReceived(disputeHash);

        stub.configure(0, false, false);
        homeGateway.createReceivedDispute(_decoded(data));
        assertTrue(homeGateway.getReceivedDispute(disputeHash).created, "created on retry");
    }

    /// @dev A balance below the cost reverts, and the dispute is created once the gateway is funded.
    function test_createReceivedDispute_insufficientBalance_staysReceived() public {
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0, 1), 2);
        uint256 cost = ruler.arbitrationCost(extraData);
        vm.deal(address(homeGateway), cost - 1);
        uint256 nextHomeDisputeID = ruler.getNextDisputeID();

        vm.expectRevert(abi.encodeWithSelector(HomeGateway.InsufficientFunds.selector, cost, cost - 1));
        homeGateway.createReceivedDispute(_decoded(data));
        _assertStillReceived(disputeHash);
        assertEq(ruler.getNextDisputeID(), nextHomeDisputeID, "no dispute on the ruler");

        vm.deal(address(homeGateway), cost);
        homeGateway.createReceivedDispute(_decoded(data));
        assertTrue(homeGateway.getReceivedDispute(disputeHash).created, "created once funded");
        assertEq(address(homeGateway).balance, 0, "arbitration cost paid");
    }

    /// @dev A caller that starves the arbitrator of gas only makes the call revert: with no try, nothing is recorded.
    function test_createReceivedDispute_underGassed_recordsNothing() public {
        _useStub(1_000_000, false, false);
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0), 1);

        vm.prank(other);
        (bool success, ) = address(homeGateway).call{gas: 500_000}(
            abi.encodeCall(HomeGateway.createReceivedDispute, (_decoded(data)))
        );
        assertFalse(success, "out of gas");
        _assertStillReceived(disputeHash);

        homeGateway.createReceivedDispute(_decoded(data));
        assertTrue(homeGateway.getReceivedDispute(disputeHash).created, "created with enough gas");
    }

    /// @dev The dispute is marked created before the arbitrator is called, so an arbitrator calling back cannot have
    /// it created twice.
    function test_createReceivedDispute_reentrantArbitrator_createsOnce() public {
        ArbitratorStub stub = _useStub(0, false, false);
        (, bytes memory data) = _delivered(_ids(0), 1);
        stub.setReentry(abi.encodeCall(HomeGateway.createReceivedDispute, (_decoded(data))));

        homeGateway.createReceivedDispute(_decoded(data));
        assertEq(stub.disputeCount(), 1, "created once");
        assertFalse(stub.reentrySucceeded(), "reentry rejected");
        assertEq(stub.reentryResult(), abi.encodeWithSelector(HomeGateway.DisputeAlreadyCreated.selector), "reason");
    }

    /// @dev The dispute hash does not cover the template, so the whole message must be the delivered one: no caller can
    /// create the dispute with another template, and the delivered one is the one emitted.
    function test_createReceivedDispute_otherTemplate_reverts() public {
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0), 1);
        IForeignGateway.DisputeMessage memory altered = _decoded(data);
        altered.templateUri = "/ipfs/other";
        vm.expectRevert(HomeGateway.UnexpectedMessage.selector);
        homeGateway.createReceivedDispute(altered);
        altered = _decoded(data);
        altered.templateId = TEMPLATE_ID + 1;
        vm.expectRevert(HomeGateway.UnexpectedMessage.selector);
        homeGateway.createReceivedDispute(altered);
        altered = _decoded(data);
        altered.externalDisputeID = EXTERNAL_DISPUTE_ID + 1;
        vm.expectRevert(HomeGateway.UnexpectedMessage.selector);
        homeGateway.createReceivedDispute(altered);
        _assertStillReceived(disputeHash);

        uint256 homeDisputeID = ruler.getNextDisputeID();
        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit IArbitrableV2.DisputeRequest(
            IArbitratorV2(address(ruler)),
            homeDisputeID,
            EXTERNAL_DISPUTE_ID,
            TEMPLATE_ID,
            TEMPLATE_URI
        );
        homeGateway.createReceivedDispute(_decoded(data));
    }

    /// @dev A message changed in a field the dispute hash covers finds another dispute, which was never delivered.
    function test_createReceivedDispute_notDelivered_reverts() public {
        (, , Message memory message) = _relayed(_ids(0), 1);
        vm.expectRevert(HomeGateway.DisputeDoesNotExist.selector);
        homeGateway.createReceivedDispute(_decoded(message.data));

        (, bytes memory data) = _delivered(_ids(0), 1);
        IForeignGateway.DisputeMessage memory altered = _decoded(data);
        altered.choices = CHOICES + 1;
        vm.expectRevert(HomeGateway.DisputeDoesNotExist.selector);
        homeGateway.createReceivedDispute(altered);
    }

    /// @dev The timeout only opens `sendCreationFailure`: the dispute can still be created until the failure is sent,
    /// and then it can no longer fail.
    function test_createReceivedDispute_afterTheTimeout_stopsTheFailure() public {
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0), 1);
        vm.warp(block.timestamp + homeGateway.creationTimeout() + 1);
        homeGateway.createReceivedDispute(_decoded(data));

        vm.expectRevert(HomeGateway.DisputeAlreadyCreated.selector);
        homeGateway.sendCreationFailure(disputeHash);
        vm.expectRevert(HomeGateway.DisputeAlreadyCreated.selector);
        homeGateway.createReceivedDispute(_decoded(data));
    }

    /// @dev A created dispute sends nothing back: Yaho dispatches only its ruling.
    function test_createdDispute_dispatchesNoFailure() public {
        uint256 nonce = homeYaho.currentNonce();
        (, uint256 homeDisputeID, bytes32 disputeHash) = _disputeOnHome(extraData, _ids(0, 1), 2);
        assertTrue(homeGateway.getReceivedDispute(disputeHash).created, "created");
        assertFalse(homeGateway.getReceivedDispute(disputeHash).creationFailed, "no failure recorded");
        assertEq(homeYaho.currentNonce(), nonce, "nothing dispatched");

        _ruleOnHome(homeDisputeID, 1);
        assertEq(homeYaho.currentNonce(), nonce + 1, "only the ruling dispatched");
    }

    // ************************************* //
    // *         Creation failure          * //
    // ************************************* //

    /// @dev Before the timeout the failure cannot be sent. From then on anyone sends it over the dispute's oracles, and
    /// the arbitration cost stays in the gateway.
    function test_sendCreationFailure_afterTheTimeout_dispatchesOverTheDisputeOracles() public {
        uint256 deliveredAt = 100 days;
        vm.warp(deliveredAt);
        (bytes32 disputeHash, ) = _delivered(_ids(0, 1), 2);
        assertEq(homeGateway.getReceivedDispute(disputeHash).receivedAt, deliveredAt, "received at the delivery");
        uint256 failableAt = deliveredAt + homeGateway.creationTimeout();
        uint256 balance = address(homeGateway).balance;

        vm.warp(failableAt - 1);
        vm.expectRevert(HomeGateway.CreationTimeoutNotPassed.selector);
        homeGateway.sendCreationFailure(disputeHash);

        vm.warp(failableAt);
        (uint256 failureId, Message memory failure) = _nextFailure(disputeHash);
        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit HomeGateway.DisputeCreationFailed(disputeHash, failureId);
        vm.prank(other);
        assertEq(homeGateway.sendCreationFailure(disputeHash), failureId, "message ID");

        HomeGateway.ReceivedDispute memory receivedDispute = homeGateway.getReceivedDispute(disputeHash);
        assertTrue(receivedDispute.creationFailed, "creation failed");
        assertFalse(receivedDispute.created, "not created");
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), 0, "no home dispute ID");
        assertEq(address(homeGateway).balance, balance, "arbitration cost kept");
        assertEq(homeYaho.currentNonce(), failure.nonce + 1, "one message dispatched");
        for (uint256 i = 0; i < NB_ORACLES; i++) {
            assertEq(address(homeReporters[i].lastAdapter()), address(foreignAdapters[i]), "adapter");
            _assertReported(homeReporters[i], homeYaho, failureId, failure);
        }
    }

    function test_sendCreationFailure_notDelivered_reverts() public {
        (bytes32 disputeHash, , ) = _relayed(_ids(0), 1);
        vm.warp(block.timestamp + homeGateway.creationTimeout());
        vm.expectRevert(HomeGateway.DisputeDoesNotExist.selector);
        homeGateway.sendCreationFailure(disputeHash);
    }

    /// @dev A failed dispute is never created, fails once, and has no home dispute ID to rule. Delivering it again, as
    /// a new Yaru would after `changeYaru`, is rejected.
    function test_failedDispute_cannotBeCreatedFailedAgainOrRuled() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        _deliver(homeYaru, foreignYaho, messageId, message);
        _sendCreationFailure(disputeHash);

        vm.expectRevert(HomeGateway.CreationFailureAlreadySent.selector);
        homeGateway.createReceivedDispute(_decoded(message.data));
        vm.expectRevert(HomeGateway.CreationFailureAlreadySent.selector);
        homeGateway.sendCreationFailure(disputeHash);
        vm.prank(homeYaru);
        vm.expectRevert(HomeGateway.DisputeAlreadyReceived.selector);
        homeGateway.onMessage(messageId, block.chainid, message.sender, 1, message.adapters, message.data);
        uint256 homeDisputeID = homeGateway.disputeHashToHomeID(disputeHash);
        vm.prank(address(ruler));
        vm.expectRevert(HomeGateway.DisputeDoesNotExist.selector);
        homeGateway.rule(homeDisputeID, 1);
    }

    /// @dev A failure dispatch that reverts (a reporter is down) reverts `sendCreationFailure`, with nothing recorded
    /// or dispatched. Once the governor replaced the reporter, the failure is sent.
    function test_failureDispatchReverts_thenSentOnceTheReporterIsReplaced() public {
        (bytes32 disputeHash, ) = _delivered(_ids(0, 1), 2);
        IReporter working = _breakReporter(1);
        vm.warp(block.timestamp + homeGateway.creationTimeout());
        uint256 nonce = homeYaho.currentNonce();

        vm.expectRevert(RevertingReporter.ReporterDown.selector);
        homeGateway.sendCreationFailure(disputeHash);
        _assertStillReceived(disputeHash);
        assertEq(homeYaho.currentNonce(), nonce, "nothing dispatched");
        assertEq(homeReporters[0].dispatchCount(), 0, "working reporter rolled back");

        vm.prank(governor);
        homeGateway.setOracleReporter(1, working);
        (uint256 failureId, Message memory failure) = _nextFailure(disputeHash);
        homeGateway.sendCreationFailure(disputeHash);
        assertTrue(homeGateway.getReceivedDispute(disputeHash).creationFailed, "creation failed");
        for (uint256 i = 0; i < NB_ORACLES; i++) _assertReported(homeReporters[i], homeYaho, failureId, failure);
    }

    /// @dev `creationFailed` is set before the failure is dispatched, so a reporter calling back during the dispatch
    /// cannot have the dispute created.
    function test_sendCreationFailure_reentrantReporter_cannotCreate() public {
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0), 1);
        ReenteringReporter reporter = new ReenteringReporter();
        reporter.arm(address(homeGateway), abi.encodeCall(HomeGateway.createReceivedDispute, (_decoded(data))));
        vm.prank(governor);
        homeGateway.setOracleReporter(0, reporter);
        vm.warp(block.timestamp + homeGateway.creationTimeout());

        homeGateway.sendCreationFailure(disputeHash);
        assertFalse(reporter.reentrySucceeded(), "reentry rejected");
        assertEq(
            reporter.reentryResult(),
            abi.encodeWithSelector(HomeGateway.CreationFailureAlreadySent.selector),
            "reentry reason"
        );
        HomeGateway.ReceivedDispute memory receivedDispute = homeGateway.getReceivedDispute(disputeHash);
        assertTrue(receivedDispute.creationFailed, "failed");
        assertFalse(receivedDispute.created, "not created");
    }

    /// @dev The creation uses the stored foreign chain ID, which Yaru delivered, not the chain it runs on.
    function test_createReceivedDispute_usesTheForeignChainID() public {
        (bytes32 disputeHash, bytes memory data) = _delivered(_ids(0), 1);
        IForeignGateway.DisputeMessage memory disputeMessage = _decoded(data);
        uint256 foreignChainID = homeGateway.foreignChainID();
        uint256 homeDisputeID = ruler.getNextDisputeID();
        vm.chainId(foreignChainID + 1);

        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit IHomeGateway.CrossChainDisputeIncoming(
            IArbitratorV2(address(ruler)),
            foreignChainID,
            disputeMessage.foreignArbitrable,
            disputeMessage.foreignDisputeID,
            homeDisputeID,
            EXTERNAL_DISPUTE_ID,
            TEMPLATE_ID,
            TEMPLATE_URI
        );
        homeGateway.createReceivedDispute(disputeMessage);
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "created under the delivered hash");
    }

    // ************************************* //
    // *         Creation timeout          * //
    // ************************************* //

    function test_creationTimeout_defaultsToSevenDays() public view {
        assertEq(homeGateway.creationTimeout(), 7 days, "creation timeout");
    }

    /// @dev A new timeout applies to the disputes already received.
    function test_changeCreationTimeout_appliesToReceivedDisputes() public {
        (bytes32 disputeHash, ) = _delivered(_ids(0, 1), 2);
        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit CreationTimeoutChanged(1 days);
        vm.prank(governor);
        homeGateway.changeCreationTimeout(1 days);
        assertEq(homeGateway.creationTimeout(), 1 days, "creation timeout");

        vm.warp(block.timestamp + 1 days);
        homeGateway.sendCreationFailure(disputeHash);
        assertTrue(homeGateway.getReceivedDispute(disputeHash).creationFailed, "creation failed");
    }
}
