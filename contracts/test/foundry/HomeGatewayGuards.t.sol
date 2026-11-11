// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HomeGateway} from "../../src/gateway/HomeGateway.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {IForeignGateway} from "../../src/gateway/interfaces/IForeignGateway.sol";
import {IArbitratorV2} from "../../src/arbitration/interfaces/IArbitratorV2.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {GatewayHarness} from "./gateway/GatewayHarness.sol";

/// @dev A recipient that rejects native currency.
contract RejectsNativeHome {}

// ************************************* //
// *     Dispute leg: provenance       * //
// ************************************* //

/// @dev `onMessage` accepts a dispute only from Yaru, from the foreign chain and the ForeignGateway, verified by exactly
/// the dispute-leg adapters of the oracles it selects, with a threshold of at least `minThreshold` and no oracle
/// selected twice. A rejected delivery reverts, so the message stays executable.
contract HomeGatewayProvenanceTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));

    event MinThresholdChanged(uint256 _minThreshold);

    function _relayed(
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal returns (bytes32 disputeHash, uint256 messageId, Message memory message) {
        uint256 foreignDisputeID = _createDispute(extraData, _oracleIDs, _threshold);
        (messageId, message) = _relay(foreignDisputeID, extraData);
        disputeHash = _disputeHash(foreignDisputeID, extraData);
    }

    /// @dev A dispute message the ForeignGateway never relayed, selecting `_oracleIDs` with `_threshold`.
    function _forged(
        uint256 _foreignDisputeID,
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal view returns (bytes memory) {
        return
            abi.encode(
                IForeignGateway.DisputeMessage({
                    foreignArbitrable: other,
                    foreignDisputeID: _foreignDisputeID,
                    choices: CHOICES,
                    extraData: extraData,
                    externalDisputeID: 0,
                    templateId: 0,
                    templateUri: "",
                    oracleIDs: _oracleIDs,
                    threshold: _threshold
                })
            );
    }

    function _onMessage(uint256 _threshold, IAdapter[] memory _adapters, bytes memory _data) internal {
        vm.prank(homeYaru);
        homeGateway.onMessage(0, block.chainid, address(foreignGateway), _threshold, _adapters, _data);
    }

    function _oneAdapter(IAdapter _adapter) internal pure returns (IAdapter[] memory adapters) {
        adapters = new IAdapter[](1);
        adapters[0] = _adapter;
    }

    function _received(bytes32 _disputeHash) internal view returns (bool) {
        return homeGateway.getReceivedDispute(_disputeHash).received;
    }

    /// @dev The dispute hash covers the oracle selection, so a copy of a relayed dispute verified by other oracles
    /// (here one of the two it selects, as if it were compromised) is another dispute: it cannot take the place of
    /// the relayed one, and the ForeignGateway rejects its ruling.
    function test_onMessage_copyOverAnotherSelection_isAnotherDispute() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        IForeignGateway.DisputeMessage memory copy = abi.decode(message.data, (IForeignGateway.DisputeMessage));
        copy.oracleIDs = _ids(1);
        copy.threshold = 1;
        uint256 copyHomeID = ruler.getNextDisputeID();
        _onMessage(1, _oneAdapter(homeAdapters[1]), abi.encode(copy));
        bytes32 copyHash = homeGateway.disputeIDtoHash(copyHomeID);
        assertTrue(_received(copyHash), "the copy is created");
        assertTrue(copyHash != disputeHash, "under another hash");

        uint256 homeDisputeID = ruler.getNextDisputeID();
        _deliver(homeYaru, foreignYaho, messageId, message);
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "the relayed dispute is created");

        (uint256 copyRulingId, Message memory copyRuling) = _ruleOnHome(copyHomeID, 1);
        vm.prank(foreignYaru);
        vm.expectRevert(ForeignGateway.DisputeDoesNotExist.selector);
        foreignGateway.onMessage(
            copyRulingId,
            block.chainid,
            copyRuling.sender,
            copyRuling.threshold,
            copyRuling.adapters,
            copyRuling.data
        );
        (uint256 rulingId, Message memory ruling) = _ruleOnHome(homeDisputeID, 2);
        _deliver(foreignYaru, homeYaho, rulingId, ruling);
        assertEq(rulingCount, 1, "ruled once");
        assertEq(lastRuling, 2, "by the relayed dispute");
    }

    function test_onMessage_onlyYaru() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        vm.prank(other);
        vm.expectRevert(HomeGateway.YaruOnly.selector);
        homeGateway.onMessage(messageId, block.chainid, message.sender, 1, message.adapters, message.data);
        assertFalse(_received(disputeHash), "not created");
    }

    function test_onMessage_wrongSourceChain_reverts() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        vm.prank(homeYaru);
        vm.expectRevert(HomeGateway.WrongSourceChain.selector);
        homeGateway.onMessage(messageId, block.chainid + 1, message.sender, 1, message.adapters, message.data);
        assertFalse(_received(disputeHash), "not created");
    }

    function test_onMessage_wrongSender_reverts() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        vm.prank(homeYaru);
        vm.expectRevert(HomeGateway.ForeignGatewayMessageSenderOnly.selector);
        homeGateway.onMessage(messageId, block.chainid, other, 1, message.adapters, message.data);
        assertFalse(_received(disputeHash), "not created");
    }

    function test_onMessage_thresholdOtherThanTheSelectedOne_reverts() public {
        (bytes32 disputeHash, , Message memory message) = _relayed(_ids(0, 1), 2);
        vm.expectRevert(HomeGateway.UnexpectedAdapters.selector);
        _onMessage(1, message.adapters, message.data);
        assertFalse(_received(disputeHash), "not created");
    }

    /// @dev One more adapter than the selection, with the selected threshold: Hashi would count the threshold over
    /// all of them.
    function test_onMessage_extraAdapter_reverts() public {
        (bytes32 disputeHash, , Message memory message) = _relayed(_ids(0), 1);
        vm.expectRevert(HomeGateway.UnexpectedAdapters.selector);
        _onMessage(1, _adapters(homeAdapters[0], homeAdapters[1]), message.data);
        assertFalse(_received(disputeHash), "not created");
    }

    function test_onMessage_adaptersOutOfOrder_reverts() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        vm.expectRevert(HomeGateway.UnexpectedAdapters.selector);
        _onMessage(2, _adapters(homeAdapters[1], homeAdapters[0]), message.data);
        assertFalse(_received(disputeHash), "not created");

        _deliver(homeYaru, foreignYaho, messageId, message);
        assertTrue(_received(disputeHash), "created with the selected adapters");
    }

    function test_onMessage_unregisteredOracle_reverts() public {
        IAdapter adapter = IAdapter(makeAddr("unregisteredAdapter"));
        vm.expectRevert(HomeGateway.UnexpectedAdapters.selector);
        _onMessage(1, _oneAdapter(adapter), _forged(1, _ids(NB_ORACLES), 1));
    }

    function test_onMessage_zeroThreshold_reverts() public {
        vm.expectRevert(abi.encodeWithSelector(HomeGateway.ThresholdBelowMinimum.selector, 0));
        _onMessage(0, _oneAdapter(homeAdapters[0]), _forged(1, _ids(0), 0));
    }

    /// @dev Hashi does not dedupe adapters: [1, 1] with a threshold of 2 would count one bridge twice.
    function test_onMessage_oracleSelectedTwice_reverts() public {
        vm.expectRevert(abi.encodeWithSelector(HomeGateway.DuplicateOracle.selector, 1));
        _onMessage(2, _adapters(homeAdapters[1], homeAdapters[1]), _forged(1, _ids(1, 1), 2));
    }

    /// @dev The message carries its own selection, so with no minimum one compromised oracle can attest a dispute the
    /// ForeignGateway never relayed, at a threshold of 1 over itself. With `minThreshold` at 2 it cannot.
    function test_minThreshold_stopsAForgedSingleOracleDispute() public {
        uint256 nextHomeDisputeID = ruler.getNextDisputeID();
        _onMessage(1, _oneAdapter(homeAdapters[1]), _forged(1, _ids(1), 1));
        assertEq(ruler.getNextDisputeID(), nextHomeDisputeID + 1, "forged without a minimum");

        vm.prank(governor);
        homeGateway.changeMinThreshold(2);
        uint256 balance = address(homeGateway).balance;
        vm.expectRevert(abi.encodeWithSelector(HomeGateway.ThresholdBelowMinimum.selector, 2));
        _onMessage(1, _oneAdapter(homeAdapters[1]), _forged(2, _ids(1), 1));
        assertEq(ruler.getNextDisputeID(), nextHomeDisputeID + 1, "no dispute forged");
        assertEq(address(homeGateway).balance, balance, "nothing paid");
    }

    function test_minThreshold_disputeAtTheMinimumIsCreated() public {
        vm.prank(governor);
        homeGateway.changeMinThreshold(2);
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0, 1), 2);
        _deliver(homeYaru, foreignYaho, messageId, message);
        assertTrue(_received(disputeHash), "created");
    }

    /// @dev A dispute relayed below a minimum raised afterwards stays executable, and is created once it is lowered.
    function test_minThreshold_raisedOverAnUndeliveredDispute_revertsUntilLowered() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        vm.prank(governor);
        homeGateway.changeMinThreshold(2);
        vm.expectRevert(abi.encodeWithSelector(HomeGateway.ThresholdBelowMinimum.selector, 2));
        _onMessage(1, message.adapters, message.data);

        vm.prank(governor);
        homeGateway.changeMinThreshold(1);
        _deliver(homeYaru, foreignYaho, messageId, message);
        assertTrue(_received(disputeHash), "created");
    }

    function test_changeMinThreshold_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.changeMinThreshold(2);
    }

    function test_changeMinThreshold_setsAndEmits() public {
        vm.expectEmit(true, true, true, true, address(homeGateway));
        emit MinThresholdChanged(2);
        vm.prank(governor);
        homeGateway.changeMinThreshold(2);
        assertEq(homeGateway.minThreshold(), 2, "min threshold");
    }

    /// @dev A message executed again, as by a new Yaru after `changeYaru`, does not create a second dispute.
    function test_createdDispute_redelivery_reverts() public {
        (bytes32 disputeHash, uint256 messageId, Message memory message) = _relayed(_ids(0), 1);
        _deliver(homeYaru, foreignYaho, messageId, message);
        uint256 homeDisputeID = homeGateway.disputeHashToHomeID(disputeHash);
        uint256 nextHomeDisputeID = ruler.getNextDisputeID();
        uint256 balance = address(homeGateway).balance;

        vm.expectRevert(HomeGateway.DisputeAlreadyReceived.selector);
        _onMessage(1, message.adapters, message.data);
        assertEq(ruler.getNextDisputeID(), nextHomeDisputeID, "no second dispute");
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "home dispute ID kept");
        assertEq(address(homeGateway).balance, balance, "nothing paid");
    }

    function test_rule_onlyArbitrator() public {
        (, uint256 homeDisputeID, ) = _disputeOnHome(extraData, _ids(0), 1);
        uint256 nonce = homeYaho.currentNonce();
        vm.prank(other);
        vm.expectRevert(HomeGateway.ArbitratorOnly.selector);
        homeGateway.rule(homeDisputeID, 1);
        assertEq(homeYaho.currentNonce(), nonce, "no ruling dispatched");
    }
}

// ************************************* //
// *       Governance and registry     * //
// ************************************* //

contract HomeGatewayGovernanceTest is GatewayHarness {
    function test_governorOnly() public {
        vm.startPrank(other);
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.changeGovernor(other);
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.changeArbitrator(IArbitratorV2(other));
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.changeForeignGateway(other);
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.changeYaho(IYaho(other));
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.changeYaru(other);
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.addOracle(IReporter(other), IAdapter(makeAddr("a")), IAdapter(makeAddr("b")));
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.withdraw(payable(other), 1);
        address implementation = address(new HomeGateway());
        vm.expectRevert(HomeGateway.GovernorOnly.selector);
        homeGateway.upgradeToAndCall(implementation, "");
        vm.stopPrank();

        assertEq(homeGateway.governor(), governor, "governor");
        assertEq(address(homeGateway.arbitrator()), address(ruler), "arbitrator");
        assertEq(homeGateway.foreignGateway(), address(foreignGateway), "foreign gateway");
        assertEq(address(homeGateway.yaho()), address(homeYaho), "yaho");
        assertEq(homeGateway.yaru(), homeYaru, "yaru");
        assertEq(homeGateway.oracleCount(), NB_ORACLES, "oracles");
    }

    function test_governorSetters() public {
        vm.startPrank(governor);
        homeGateway.changeArbitrator(IArbitratorV2(other));
        homeGateway.changeForeignGateway(other);
        homeGateway.changeYaho(IYaho(other));
        homeGateway.changeYaru(other);
        address implementation = address(new HomeGateway());
        homeGateway.upgradeToAndCall(implementation, "");
        homeGateway.changeGovernor(other);
        vm.stopPrank();

        assertEq(homeGateway.governor(), other, "governor");
        assertEq(address(homeGateway.arbitrator()), other, "arbitrator");
        assertEq(homeGateway.foreignGateway(), other, "foreign gateway");
        assertEq(address(homeGateway.yaho()), other, "yaho");
        assertEq(homeGateway.yaru(), other, "yaru");
    }

    function test_withdraw_paysTheRecipient() public {
        address payable recipient = payable(makeAddr("recipient"));
        uint256 balance = address(homeGateway).balance;
        vm.prank(governor);
        homeGateway.withdraw(recipient, 1 ether);
        assertEq(recipient.balance, 1 ether, "paid");
        assertEq(address(homeGateway).balance, balance - 1 ether, "gateway balance");
    }

    function test_withdraw_rejectingRecipient_reverts() public {
        address payable recipient = payable(address(new RejectsNativeHome()));
        uint256 balance = address(homeGateway).balance;
        vm.prank(governor);
        vm.expectRevert(HomeGateway.TransferFailed.selector);
        homeGateway.withdraw(recipient, 1 ether);
        assertEq(address(homeGateway).balance, balance, "nothing withdrawn");
    }

    function test_addOracle_zeroAdapter_reverts() public {
        vm.startPrank(governor);
        vm.expectRevert(HomeGateway.InvalidOracle.selector);
        homeGateway.addOracle(IReporter(other), IAdapter(address(0)), IAdapter(makeAddr("inbound")));
        vm.expectRevert(HomeGateway.InvalidOracle.selector);
        homeGateway.addOracle(IReporter(other), IAdapter(makeAddr("outbound")), IAdapter(address(0)));
        vm.stopPrank();
        assertEq(homeGateway.oracleCount(), NB_ORACLES, "no oracle added");
    }

    /// @dev One adapter under two IDs would make a two-oracle selection one bridge on that leg.
    function test_addOracle_reusedAdapter_reverts() public {
        vm.startPrank(governor);
        vm.expectRevert(HomeGateway.AdapterAlreadyUsed.selector);
        homeGateway.addOracle(IReporter(other), foreignAdapters[0], IAdapter(makeAddr("inbound")));
        vm.expectRevert(HomeGateway.AdapterAlreadyUsed.selector);
        homeGateway.addOracle(IReporter(other), IAdapter(makeAddr("outbound")), homeAdapters[0]);
        vm.stopPrank();
        assertEq(homeGateway.oracleCount(), NB_ORACLES, "no oracle added");
    }

    function test_initialize_reusedAdapter_reverts() public {
        HomeGateway.Oracle[] memory oracles = new HomeGateway.Oracle[](2);
        oracles[0] = HomeGateway.Oracle(IReporter(other), IAdapter(makeAddr("outbound0")), IAdapter(makeAddr("in")));
        oracles[1] = HomeGateway.Oracle(IReporter(other), IAdapter(makeAddr("outbound1")), IAdapter(makeAddr("in")));
        HomeGateway gateway = HomeGateway(payable(address(new UUPSProxy(address(new HomeGateway()), ""))));

        vm.expectRevert(HomeGateway.AdapterAlreadyUsed.selector);
        gateway.initialize(governor, IArbitratorV2(address(ruler)), 1, other, IYaho(other), other, oracles);
    }
}
