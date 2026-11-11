// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {GatewayHarness} from "./gateway/GatewayHarness.sol";
import "../../src/libraries/Constants.sol";

/// @dev Burns 10% of every transfer, so the recipient gets less than the amount sent.
contract FeeOnTransferToken is ERC20 {
    constructor() ERC20("Taxed", "TAX") {
        _mint(msg.sender, 1_000_000 ether);
    }

    function _update(address _from, address _to, uint256 _value) internal override {
        if (_from != address(0) && _to != address(0)) {
            uint256 fee = _value / 10;
            super._update(_from, address(0), fee);
            _value -= fee;
        }
        super._update(_from, _to, _value);
    }
}

/// @dev `transferFrom` delivers one unit less than the amount, as stETH can by rounding its shares.
contract ShortTransferToken is TestERC20 {
    constructor() TestERC20("Short", "SHT") {}

    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool) {
        return super.transferFrom(_from, _to, _value - 1);
    }
}

/// @dev `transfer` returns false, or reverts with no data, without moving anything once set to.
contract FalseTransferToken is TestERC20 {
    bool public failTransfers;
    bool public revertTransfers;

    constructor() TestERC20("False", "FLS") {}

    function setFailTransfers(bool _fail) external {
        failTransfers = _fail;
    }

    function setRevertTransfers(bool _revert) external {
        revertTransfers = _revert;
    }

    function transfer(address _to, uint256 _value) public override returns (bool) {
        if (revertTransfers) {
            assembly ("memory-safe") {
                revert(0, 0)
            }
        }
        if (failTransfers) return false;
        return super.transfer(_to, _value);
    }
}

// ************************************* //
// *        Governance and keeper      * //
// ************************************* //

contract ForeignGatewayGovernanceTest is GatewayHarness {
    bytes32 internal constant FEE_KEY = keccak256(abi.encode("feeForJuror", MIRRORED_COURT));

    event KeeperGuardrailsChanged(uint256 _maxChangeBps, uint256 _cooldown);

    function setUp() public override {
        super.setUp();
        vm.warp(block.timestamp + 1 days); // Past the first cooldown, counted from timestamp 0.
    }

    function test_governorOnly() public {
        address[2] memory callers = [other, keeper];
        for (uint256 i = 0; i < callers.length; i++) {
            vm.startPrank(callers[i]);
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.changeGovernor(callers[i]);
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.changeKeeper(callers[i]);
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.changeHomeGateway(callers[i]);
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.changeKeeperGuardrails(10_000, 0);
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.addOracle(IReporter(other), IAdapter(makeAddr("a")), IAdapter(makeAddr("b")));
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.setDefaultOracles(_ids(1), 1);
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.changeMinThreshold(1);
            address implementation = address(new ForeignGateway());
            vm.expectRevert(ForeignGateway.GovernorOnly.selector);
            foreignGateway.upgradeToAndCall(implementation, "");
            vm.stopPrank();
        }

        assertEq(foreignGateway.governor(), governor, "governor");
        assertEq(foreignGateway.keeper(), keeper, "keeper");
        assertEq(foreignGateway.homeGateway(), address(homeGateway), "home gateway");
        assertEq(foreignGateway.keeperMaxChangeBps(), 500, "max change");
        assertEq(foreignGateway.oracleCount(), NB_ORACLES, "oracles");
        assertEq(foreignGateway.getDefaultOracles().oracleIDs, _ids(0), "default oracles");
    }

    function test_governorSetters() public {
        vm.startPrank(governor);
        foreignGateway.changeKeeper(other);
        foreignGateway.changeHomeGateway(other);
        foreignGateway.setDefaultOracles(_ids(1), 1);
        address implementation = address(new ForeignGateway());
        foreignGateway.upgradeToAndCall(implementation, "");
        foreignGateway.changeGovernor(other);
        vm.stopPrank();

        assertEq(foreignGateway.governor(), other, "governor");
        assertEq(foreignGateway.keeper(), other, "keeper");
        assertEq(foreignGateway.homeGateway(), other, "home gateway");
        assertEq(foreignGateway.getDefaultOracles().oracleIDs, _ids(1), "default oracles");
    }

    function test_feeSetters_onlyGovernorOrKeeper() public {
        TestERC20 token = _acceptToken();
        vm.startPrank(other);
        vm.expectRevert(ForeignGateway.GovernorOrKeeperOnly.selector);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, MIRRORED_COURT_FEE);
        vm.expectRevert(ForeignGateway.GovernorOrKeeperOnly.selector);
        foreignGateway.changeHomeNativeRate(1e18);
        vm.expectRevert(ForeignGateway.GovernorOrKeeperOnly.selector);
        foreignGateway.setOracleBridgingCost(0, 1);
        vm.expectRevert(ForeignGateway.GovernorOrKeeperOnly.selector);
        foreignGateway.changeCurrencyRates(token, 100, 0);
        vm.stopPrank();
    }

    /// @dev Each keeper update moves its value by at most 5% and waits an hour before the same value moves again.
    function test_keeper_courtJurorFee_withinTheLimitThenCooldown() public {
        uint256 raised = (MIRRORED_COURT_FEE * 105) / 100;
        vm.startPrank(keeper);
        vm.expectRevert(ForeignGateway.KeeperChangeTooLarge.selector);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, raised + 1);
        vm.expectRevert(ForeignGateway.KeeperChangeTooLarge.selector);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, (MIRRORED_COURT_FEE * 95) / 100 - 1);

        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, raised);
        assertEq(foreignGateway.feeForJuror(MIRRORED_COURT), raised, "keeper update");
        assertEq(foreignGateway.lastKeeperUpdate(FEE_KEY), block.timestamp, "update time");

        vm.expectRevert(ForeignGateway.KeeperCooldownActive.selector);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, raised);
        foreignGateway.changeCourtJurorFee(GENERAL_COURT, (GENERAL_FEE * 105) / 100); // Its own cooldown.
        vm.warp(block.timestamp + 1 hours);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, MIRRORED_COURT_FEE);
        vm.stopPrank();
        assertEq(foreignGateway.feeForJuror(MIRRORED_COURT), MIRRORED_COURT_FEE, "after the cooldown");
    }

    function test_keeper_homeNativeRate_withinTheLimitThenCooldown() public {
        vm.startPrank(keeper);
        vm.expectRevert(ForeignGateway.KeeperChangeTooLarge.selector);
        foreignGateway.changeHomeNativeRate(1.06e18);
        foreignGateway.changeHomeNativeRate(1.05e18);
        vm.expectRevert(ForeignGateway.KeeperCooldownActive.selector);
        foreignGateway.changeHomeNativeRate(1e18);
        vm.stopPrank();
        assertEq(foreignGateway.homeNativeRate(), 1.05e18, "rate");
    }

    /// @dev A value at zero moves by more than any percentage, so only the governor can set it.
    function test_keeper_oracleBridgingCost_fromZeroOnlyByTheGovernor() public {
        vm.prank(keeper);
        vm.expectRevert(ForeignGateway.KeeperChangeTooLarge.selector);
        foreignGateway.setOracleBridgingCost(0, 1);

        vm.prank(governor);
        foreignGateway.setOracleBridgingCost(0, 1000);
        vm.startPrank(keeper);
        foreignGateway.setOracleBridgingCost(0, 1050);
        vm.expectRevert(ForeignGateway.KeeperCooldownActive.selector);
        foreignGateway.setOracleBridgingCost(0, 1000);
        vm.stopPrank();
        assertEq(foreignGateway.oracleBridgingCost(0), 1050, "cost");
    }

    function test_keeper_currencyRate_cannotChangeDecimals() public {
        TestERC20 token = _acceptToken();
        vm.startPrank(keeper);
        vm.expectRevert(ForeignGateway.KeeperCannotChangeDecimals.selector);
        foreignGateway.changeCurrencyRates(token, 100, 1);
        vm.expectRevert(ForeignGateway.KeeperChangeTooLarge.selector);
        foreignGateway.changeCurrencyRates(token, 106, 0);
        foreignGateway.changeCurrencyRates(token, 105, 0);
        vm.expectRevert(ForeignGateway.KeeperCooldownActive.selector);
        foreignGateway.changeCurrencyRates(token, 100, 0);
        vm.stopPrank();
        (, uint64 rateInEth, uint8 rateDecimals) = foreignGateway.currencyRates(token);
        assertEq(rateInEth, 105, "rate");
        assertEq(rateDecimals, 0, "decimals");
    }

    function test_governor_isNotLimited() public {
        vm.startPrank(governor);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, MIRRORED_COURT_FEE * 10);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, MIRRORED_COURT_FEE);
        vm.stopPrank();
        assertEq(foreignGateway.lastKeeperUpdate(FEE_KEY), 0, "no keeper update recorded");
    }

    function test_changeKeeperGuardrails_setsEmitsAndApplies() public {
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit KeeperGuardrailsChanged(10_000, 0);
        vm.prank(governor);
        foreignGateway.changeKeeperGuardrails(10_000, 0);

        vm.startPrank(keeper);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, MIRRORED_COURT_FEE * 2);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, MIRRORED_COURT_FEE);
        vm.stopPrank();
    }

    function _acceptToken() internal returns (TestERC20 token) {
        token = new TestERC20("Test", "TST");
        vm.startPrank(governor);
        foreignGateway.changeAcceptedFeeTokens(token, true);
        foreignGateway.changeCurrencyRates(token, 100, 0);
        vm.stopPrank();
    }
}

// ************************************* //
// *      Selections and registry      * //
// ************************************* //

contract ForeignGatewaySelectionTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));

    event MinThresholdChanged(uint256 _minThreshold);

    function _create(uint256[] memory _oracleIDs, uint256 _threshold) internal returns (uint256) {
        return foreignGateway.createDispute{value: 1 ether}(CHOICES, extraData, _oracleIDs, _threshold);
    }

    function test_selection_invalidThreshold_reverts() public {
        vm.expectRevert(ForeignGateway.InvalidThreshold.selector);
        _create(_ids(0, 1), 0);
        vm.expectRevert(ForeignGateway.InvalidThreshold.selector);
        _create(_ids(0, 1), 3);
        vm.startPrank(governor);
        vm.expectRevert(ForeignGateway.InvalidThreshold.selector);
        foreignGateway.setDefaultOracles(_ids(0), 0);
        vm.expectRevert(ForeignGateway.InvalidThreshold.selector);
        foreignGateway.setDefaultOracles(_ids(0), 2);
        vm.stopPrank();
        _create(_ids(0, 1), 2);
    }

    /// @dev Neither Hashi nor Yaho dedupes: [0, 0] with a threshold of 2 would count one bridge twice on both legs.
    function test_selection_duplicateOracle_reverts() public {
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.DuplicateOracle.selector, 0));
        _create(_ids(0, 0), 2);
        vm.prank(governor);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.DuplicateOracle.selector, 1));
        foreignGateway.setDefaultOracles(_ids(1, 1), 1);
    }

    function test_minThreshold_rejectsALowerSelection() public {
        vm.startPrank(governor);
        foreignGateway.setDefaultOracles(_ids(0, 1), 2);
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit MinThresholdChanged(2);
        foreignGateway.changeMinThreshold(2);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.ThresholdBelowMinimum.selector, 2));
        foreignGateway.setDefaultOracles(_ids(0), 1);
        vm.stopPrank();
        assertEq(foreignGateway.minThreshold(), 2, "min threshold");

        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.ThresholdBelowMinimum.selector, 2));
        _create(_ids(0, 1), 1);
        _create(_ids(0, 1), 2);
        foreignGateway.createDispute{value: 1 ether}(CHOICES, extraData); // The default selection meets it.
    }

    function test_changeMinThreshold_aboveTheDefaultSelection_reverts() public {
        vm.prank(governor);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.ThresholdBelowMinimum.selector, 2));
        foreignGateway.changeMinThreshold(2);
        assertEq(foreignGateway.minThreshold(), 0, "unchanged");
    }

    /// @dev Both gateways at a minimum of 2: a dispute over both oracles goes through, one over a single oracle is
    /// refused on the foreign chain before any fee is taken.
    function test_minThreshold_onBothGateways_roundTrip() public {
        vm.startPrank(governor);
        foreignGateway.setDefaultOracles(_ids(0, 1), 2);
        foreignGateway.changeMinThreshold(2);
        homeGateway.changeMinThreshold(2);
        vm.stopPrank();

        (uint256 foreignDisputeID, uint256 homeDisputeID, ) = _disputeOnHome(extraData, _ids(0, 1), 2);
        (uint256 messageId, Message memory message) = _ruleOnHome(homeDisputeID, 1);
        _deliver(foreignYaru, homeYaho, messageId, message);
        _executeRuling(foreignDisputeID);
        assertEq(rulingCount, 1, "ruled");
    }

    function test_addOracle_zeroAdapter_reverts() public {
        vm.startPrank(governor);
        vm.expectRevert(ForeignGateway.InvalidOracle.selector);
        foreignGateway.addOracle(IReporter(other), IAdapter(address(0)), IAdapter(makeAddr("inbound")));
        vm.expectRevert(ForeignGateway.InvalidOracle.selector);
        foreignGateway.addOracle(IReporter(other), IAdapter(makeAddr("outbound")), IAdapter(address(0)));
        vm.stopPrank();
        assertEq(foreignGateway.oracleCount(), NB_ORACLES, "no oracle added");
    }

    /// @dev One adapter under two IDs would make a two-oracle selection one bridge on that leg.
    function test_addOracle_reusedAdapter_reverts() public {
        vm.startPrank(governor);
        vm.expectRevert(ForeignGateway.AdapterAlreadyUsed.selector);
        foreignGateway.addOracle(IReporter(other), homeAdapters[0], IAdapter(makeAddr("inbound")));
        vm.expectRevert(ForeignGateway.AdapterAlreadyUsed.selector);
        foreignGateway.addOracle(IReporter(other), IAdapter(makeAddr("outbound")), foreignAdapters[0]);
        vm.stopPrank();
        assertEq(foreignGateway.oracleCount(), NB_ORACLES, "no oracle added");
    }

    function test_initialize_reusedAdapterOrZeroRate_reverts() public {
        ForeignGateway.Oracle[] memory oracles = new ForeignGateway.Oracle[](2);
        oracles[0] = ForeignGateway.Oracle(
            IReporter(other),
            IAdapter(makeAddr("out")),
            IAdapter(makeAddr("in0")),
            true
        );
        oracles[1] = ForeignGateway.Oracle(
            IReporter(other),
            IAdapter(makeAddr("out")),
            IAdapter(makeAddr("in1")),
            true
        );
        ForeignGateway gateway = ForeignGateway(address(new UUPSProxy(address(new ForeignGateway()), "")));

        vm.expectRevert(ForeignGateway.AdapterAlreadyUsed.selector);
        gateway.initialize(governor, keeper, 1, other, IYaho(other), other, 1e18, oracles, _ids(0), 1);
        vm.expectRevert(ForeignGateway.InvalidRate.selector);
        gateway.initialize(governor, keeper, 1, other, IYaho(other), other, 0, oracles, _ids(0), 1);
    }

    function test_changeHomeNativeRate_zero_reverts() public {
        vm.prank(governor);
        vm.expectRevert(ForeignGateway.InvalidRate.selector);
        foreignGateway.changeHomeNativeRate(0);
        assertEq(foreignGateway.homeNativeRate(), 1e18, "unchanged");
    }
}

// ************************************* //
// *     Fees, tokens and extraData    * //
// ************************************* //

contract ForeignGatewayFeeGuardsTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));
    uint256 internal constant JUROR_COST = MIRRORED_COURT_FEE * 3; // 0.06 ether

    function _accept(IERC20 _token, uint64 _rateInEth, uint8 _rateDecimals) internal {
        vm.startPrank(governor);
        foreignGateway.changeAcceptedFeeTokens(_token, true);
        foreignGateway.changeCurrencyRates(_token, _rateInEth, _rateDecimals);
        vm.stopPrank();
        _token.approve(address(foreignGateway), type(uint256).max);
    }

    function _relayed(uint256 _id) internal returns (bytes32 hash) {
        _relay(_id, extraData);
        hash = _disputeHash(_id, extraData);
    }

    function test_tokenNotAccepted_reverts() public {
        TestERC20 token = new TestERC20("Test", "TST");
        token.approve(address(foreignGateway), type(uint256).max);
        vm.expectRevert(ForeignGateway.TokenNotAccepted.selector);
        foreignGateway.arbitrationCost(extraData, IERC20(token));
        vm.expectRevert(ForeignGateway.TokenNotAccepted.selector);
        foreignGateway.createDispute(CHOICES, extraData, token, 1 ether);

        _accept(token, 1, 0);
        foreignGateway.createDispute(CHOICES, extraData, token, JUROR_COST);
        vm.prank(governor);
        foreignGateway.changeAcceptedFeeTokens(token, false);
        vm.expectRevert(ForeignGateway.TokenNotAccepted.selector);
        foreignGateway.createDispute(CHOICES, extraData, _ids(0), 1, token, JUROR_COST);
    }

    /// @dev A token unit worth more than the whole cost: rounding down would make the dispute free on this chain while
    /// the HomeGateway pays the full cost.
    function test_tokenCost_roundsUp_neverZero() public {
        TestERC20 token = new TestERC20("Test", "TST");
        _accept(token, 1e18, 0); // 1 token unit = 1 native.
        assertEq(foreignGateway.convertEthToTokenAmount(token, JUROR_COST), 0, "rounded down");
        assertEq(foreignGateway.arbitrationCost(extraData, IERC20(token)), 1, "rounded up");

        vm.expectRevert(ForeignGateway.ArbitrationFeesNotEnough.selector);
        foreignGateway.createDispute(CHOICES, extraData, token, 0);
        uint256 id = foreignGateway.createDispute(CHOICES, extraData, token, 1);
        (, , , , , uint256 feesForJurors, uint256 feesForBridging) = foreignGateway.disputeHashtoDisputeData(
            _disputeHash(id, extraData)
        );
        assertEq(feesForJurors + feesForBridging, 1, "fees");
    }

    function test_tokenCost_roundsUpTheRemainder() public {
        TestERC20 token = new TestERC20("Test", "TST");
        _accept(token, 7, 0);
        assertEq(JUROR_COST % 7 != 0, true, "has a remainder");
        assertEq(foreignGateway.arbitrationCost(extraData, IERC20(token)), JUROR_COST / 7 + 1, "rounded up");
        assertEq(foreignGateway.arbitrationCost(extraData, _ids(0), IERC20(token)), JUROR_COST / 7 + 1, "selected");

        vm.expectRevert(ForeignGateway.ArbitrationFeesNotEnough.selector);
        foreignGateway.createDispute(CHOICES, extraData, token, JUROR_COST / 7);
    }

    /// @dev The ledger credits the amount requested, so a token delivering less would leave it unbacked.
    function test_feeOnTransferToken_reverts() public {
        FeeOnTransferToken token = new FeeOnTransferToken();
        _accept(token, 1, 0);
        vm.expectRevert(ForeignGateway.FeeOnTransferNotSupported.selector);
        foreignGateway.createDispute(CHOICES, extraData, token, JUROR_COST);
        (uint256 total, , ) = foreignGateway.availableFees(token);
        assertEq(total, 0, "nothing credited");
        assertEq(token.balanceOf(address(foreignGateway)), 0, "nothing received");
    }

    /// @dev One unit short is enough: each such dispute would leave the ledger one unit unbacked.
    function test_shortTransferToken_reverts() public {
        ShortTransferToken token = new ShortTransferToken();
        _accept(token, 1, 0);
        vm.expectRevert(ForeignGateway.FeeOnTransferNotSupported.selector);
        foreignGateway.createDispute(CHOICES, extraData, token, JUROR_COST);
    }

    function test_feeTransferFromFails_reverts() public {
        TestERC20 token = new TestERC20("Test", "TST");
        _accept(token, 1, 0);
        token.approve(address(foreignGateway), 0);
        vm.expectRevert(ForeignGateway.TransferFailed.selector);
        foreignGateway.createDispute(CHOICES, extraData, token, JUROR_COST);
        (uint256 total, , ) = foreignGateway.availableFees(token);
        assertEq(total, 0, "nothing credited");
    }

    /// @dev A failed payout, returning false or reverting with no data, reverts, so neither the withdrawal nor the
    /// refund is counted.
    function test_feeTransferFails_withdrawAndRefundRevert() public {
        FalseTransferToken token = new FalseTransferToken();
        _accept(token, 1, 0);
        uint256 id = foreignGateway.createDispute(CHOICES, extraData, _ids(0), 1, token, JUROR_COST);
        bytes32 hash = _failed(id);

        token.setFailTransfers(true);
        _assertPayoutsRevert(token, id, hash);
        token.setFailTransfers(false);
        token.setRevertTransfers(true);
        _assertPayoutsRevert(token, id, hash);
    }

    function _assertPayoutsRevert(IERC20 _token, uint256 _id, bytes32 _hash) internal {
        vm.prank(keeper);
        vm.expectRevert(ForeignGateway.TransferFailed.selector);
        foreignGateway.withdrawFees(_token, 1, 0);
        vm.expectRevert(ForeignGateway.TransferFailed.selector);
        foreignGateway.claimRefund(_id, other);

        (, uint256 jurorFees, ) = foreignGateway.availableFees(_token);
        assertEq(jurorFees, JUROR_COST, "nothing counted");
        assertEq(foreignGateway.pendingRefunds(_id), _hash, "refund still pending");
    }

    /// @dev The refund is paid only from juror fees not withdrawn yet, up to exactly the refund.
    function test_claimRefund_boundedByTheAvailableJurorFees() public {
        uint256 id = _createDispute(extraData, _ids(0), 1);
        _failed(id);
        vm.prank(keeper);
        foreignGateway.withdrawFees(NATIVE_CURRENCY, 1, 0);
        vm.expectRevert(ForeignGateway.InsufficientFees.selector);
        foreignGateway.claimRefund(id, other);

        _createDispute(extraData, _ids(0), 1);
        vm.prank(keeper);
        foreignGateway.withdrawFees(NATIVE_CURRENCY, JUROR_COST - 1, 0);
        (, uint256 jurorFees, ) = foreignGateway.availableFees(NATIVE_CURRENCY);
        assertEq(jurorFees, JUROR_COST, "exactly the refund left");
        uint256 balanceBefore = other.balance;
        foreignGateway.claimRefund(id, other);
        assertEq(other.balance, balanceBefore + JUROR_COST, "refunded");
        (, jurorFees, ) = foreignGateway.availableFees(NATIVE_CURRENCY);
        assertEq(jurorFees, 0, "counted as withdrawn");
    }

    /// @dev The template URI goes into the dispute message, so one too long to deliver is refused before dispatch.
    function test_relayDispute_templateUriTooLong_reverts() public {
        uint256 id = _createDispute(extraData, _ids(0), 1);
        uint256 max = foreignGateway.MAX_TEMPLATE_URI_LENGTH();
        vm.expectRevert(ForeignGateway.TemplateUriTooLong.selector);
        foreignGateway.relayDispute(
            id,
            CHOICES,
            extraData,
            EXTERNAL_DISPUTE_ID,
            TEMPLATE_ID,
            string(new bytes(max + 1))
        );
        assertEq(foreignYaho.currentNonce(), 0, "nothing dispatched");

        foreignGateway.relayDispute(id, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, string(new bytes(max)));
        assertEq(foreignYaho.currentNonce(), 1, "the longest is dispatched");
    }

    /// @dev Relays the dispute, delivers its creation failure, over oracle 0 alone, and gives it to the arbitrable.
    function _failed(uint256 _id) internal returns (bytes32 hash) {
        hash = _relayed(_id);
        vm.prank(foreignYaru);
        foreignGateway.onMessage(0, block.chainid, address(homeGateway), 1, _oneAdapter(), abi.encode(hash));
        _executeRuling(_id);
    }

    function test_relayDispute_twice_reverts() public {
        uint256 id = _createDispute(extraData, _ids(0), 1);
        _relay(id, extraData);
        uint256 nonce = foreignYaho.currentNonce();
        vm.expectRevert(ForeignGateway.AlreadyRelayed.selector);
        foreignGateway.relayDispute(id, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, TEMPLATE_URI);
        assertEq(foreignYaho.currentNonce(), nonce, "dispatched once");
    }

    /// @dev Only the arbitrable that created a dispute finds it: the hash covers `msg.sender`.
    function test_relayDispute_unknownDisputeOrOtherCaller_reverts() public {
        uint256 id = _createDispute(extraData, _ids(0), 1);
        vm.expectRevert(ForeignGateway.DisputeDoesNotExist.selector);
        foreignGateway.relayDispute(id + 1, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, TEMPLATE_URI);
        vm.prank(other);
        vm.expectRevert(ForeignGateway.DisputeDoesNotExist.selector);
        foreignGateway.relayDispute(id, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, TEMPLATE_URI);
        assertEq(foreignYaho.currentNonce(), 0, "nothing dispatched");
    }

    function test_onMessage_wrongSourceChain_reverts() public {
        bytes32 hash = _relayed(_createDispute(extraData, _ids(0), 1));
        vm.prank(foreignYaru);
        vm.expectRevert(ForeignGateway.WrongSourceChain.selector);
        foreignGateway.onMessage(0, block.chainid + 1, address(homeGateway), 1, _oneAdapter(), abi.encode(hash, 1));
        assertEq(rulingCount, 0, "not ruled");
    }

    /// @dev One more adapter than the selection, with its threshold: Hashi would count the threshold over all of
    /// them, so one compromised selected oracle plus any other adapter could rule.
    function test_onMessage_extraAdapter_reverts() public {
        bytes32 hash = _relayed(_createDispute(extraData, _ids(0), 1));
        vm.prank(foreignYaru);
        vm.expectRevert(ForeignGateway.UnexpectedAdapters.selector);
        foreignGateway.onMessage(
            0,
            block.chainid,
            address(homeGateway),
            1,
            _adapters(foreignAdapters[0], foreignAdapters[1]),
            abi.encode(hash, 1)
        );
        assertEq(rulingCount, 0, "not ruled");
    }

    /// @dev The dispute kit stores extraData on the home chain, so one too long to store there is refused here.
    function test_extraData_tooLong_reverts() public {
        uint256 max = foreignGateway.MAX_EXTRA_DATA_LENGTH();
        bytes memory longest = bytes.concat(extraData, new bytes(max - extraData.length));
        bytes memory tooLong = bytes.concat(longest, new bytes(1));
        TestERC20 token = new TestERC20("Test", "TST");
        _accept(token, 1, 0);

        vm.expectRevert(ForeignGateway.ExtraDataTooLong.selector);
        foreignGateway.createDispute{value: 1 ether}(CHOICES, tooLong);
        vm.expectRevert(ForeignGateway.ExtraDataTooLong.selector);
        foreignGateway.createDispute{value: 1 ether}(CHOICES, tooLong, _ids(0), 1);
        vm.expectRevert(ForeignGateway.ExtraDataTooLong.selector);
        foreignGateway.createDispute(CHOICES, tooLong, token, JUROR_COST);
        vm.expectRevert(ForeignGateway.ExtraDataTooLong.selector);
        foreignGateway.createDispute(CHOICES, tooLong, _ids(0), 1, token, JUROR_COST);

        (, , bytes32 disputeHash) = _disputeOnHome(longest, _ids(0), 1);
        assertTrue(homeGateway.getReceivedDispute(disputeHash).created, "the longest is created on the home chain");
    }

    function _oneAdapter() internal view returns (IAdapter[] memory adapters) {
        adapters = new IAdapter[](1);
        adapters[0] = foreignAdapters[0];
    }
}
