// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HomeGateway} from "../../src/gateway/HomeGateway.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {IHomeGateway} from "../../src/gateway/interfaces/IHomeGateway.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
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
