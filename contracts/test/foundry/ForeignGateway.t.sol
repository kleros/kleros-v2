// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, stdError} from "forge-std/Test.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {Yaho} from "@kleros/veashi-sdk/contracts/Yaho.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {IForeignGateway} from "../../src/gateway/interfaces/IForeignGateway.sol";
import {IArbitratorV2} from "../../src/arbitration/interfaces/IArbitratorV2.sol";
import {GatewayHarness} from "./gateway/GatewayHarness.sol";
import {VouchingReporter, RevertingReporter, SelfVouchingDispatcher} from "./gateway/Reporters.sol";
import "../../src/libraries/Constants.sol";

/// @dev Fee accounting of the ForeignGateway: the juror/bridging split at dispute creation and `withdrawFees`.
/// Disputes are created but never relayed, so Yaho, reporters and adapters are plain addresses.
contract ForeignGatewayFeesTest is Test {
    ForeignGateway gateway;
    TestERC20 feeToken;

    address governor = makeAddr("governor");
    address keeper = makeAddr("keeper");
    address other = makeAddr("other");

    uint96 constant COURT_ID = 1;
    uint256 constant MIN_JURORS = 3;
    uint256 constant FEE_FOR_JUROR = 0.01 ether; // In home native currency.
    uint256 constant HOME_NATIVE_RATE = 2e18; // 2 foreign native per home native.
    uint256 constant BRIDGING_COST_0 = 0.003 ether;
    uint256 constant BRIDGING_COST_1 = 0.005 ether;
    uint256 constant JUROR_COST = (FEE_FOR_JUROR * MIN_JURORS * HOME_NATIVE_RATE) / 1e18; // 0.06 ether

    bytes extraData;

    event FeesWithdrawn(address indexed _to, uint256 _jurorFeeAmount, uint256 _bridgingFeeAmount, IERC20 _feeToken);

    function setUp() public {
        ForeignGateway.Oracle[] memory oracles = new ForeignGateway.Oracle[](2);
        oracles[0] = ForeignGateway.Oracle({
            outboundReporter: IReporter(makeAddr("reporter0")),
            outboundAdapter: IAdapter(makeAddr("outboundAdapter0")),
            inboundAdapter: IAdapter(makeAddr("inboundAdapter0")),
            enabled: true
        });
        oracles[1] = ForeignGateway.Oracle({
            outboundReporter: IReporter(makeAddr("reporter1")),
            outboundAdapter: IAdapter(makeAddr("outboundAdapter1")),
            inboundAdapter: IAdapter(makeAddr("inboundAdapter1")),
            enabled: true
        });
        uint256[] memory defaultIDs = new uint256[](1);
        defaultIDs[0] = 0;

        ForeignGateway logic = new ForeignGateway();
        bytes memory initData = abi.encodeCall(
            ForeignGateway.initialize,
            (
                governor,
                keeper,
                42161,
                makeAddr("homeGateway"),
                IYaho(makeAddr("yaho")),
                makeAddr("yaru"),
                HOME_NATIVE_RATE,
                oracles,
                defaultIDs,
                1
            )
        );
        gateway = ForeignGateway(address(new UUPSProxy(address(logic), initData)));

        feeToken = new TestERC20("Test", "TST");
        vm.startPrank(governor);
        gateway.changeCourtJurorFee(COURT_ID, FEE_FOR_JUROR);
        gateway.setOracleBridgingCost(0, BRIDGING_COST_0);
        gateway.setOracleBridgingCost(1, BRIDGING_COST_1);
        gateway.changeAcceptedFeeTokens(feeToken, true);
        gateway.changeCurrencyRates(feeToken, 3, 0); // 1 native = 1/3 token unit: conversions round down.
        vm.stopPrank();

        feeToken.approve(address(gateway), type(uint256).max);
        extraData = abi.encode(uint256(COURT_ID), MIN_JURORS);
        vm.deal(address(this), 100 ether);
    }

    // ************************************* //
    // *        Split at creation          * //
    // ************************************* //

    function test_nativeDispute_splitsJurorAndBridgingFees() public {
        uint256 cost = gateway.arbitrationCost(extraData);
        assertEq(cost, JUROR_COST + BRIDGING_COST_0, "cost");

        uint256 disputeID = gateway.createDispute{value: cost}(2, extraData);

        _assertDisputeFees(disputeID, NATIVE_CURRENCY, JUROR_COST, BRIDGING_COST_0);
        _assertAvailable(NATIVE_CURRENCY, JUROR_COST, BRIDGING_COST_0);
    }

    function test_nativeDispute_overpaymentCountsAsJurorFees() public {
        uint256 cost = gateway.arbitrationCost(extraData);
        uint256 disputeID = gateway.createDispute{value: cost + 1 ether}(2, extraData);

        _assertDisputeFees(disputeID, NATIVE_CURRENCY, JUROR_COST + 1 ether, BRIDGING_COST_0);
        _assertAvailable(NATIVE_CURRENCY, JUROR_COST + 1 ether, BRIDGING_COST_0);
    }

    function test_nativeDispute_selectedOraclesSetTheBridgingShare() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;
        uint256 cost = gateway.arbitrationCost(extraData, ids);
        assertEq(cost, JUROR_COST + BRIDGING_COST_0 + BRIDGING_COST_1, "cost");

        uint256 disputeID = gateway.createDispute{value: cost}(2, extraData, ids, 2);

        _assertDisputeFees(disputeID, NATIVE_CURRENCY, JUROR_COST, BRIDGING_COST_0 + BRIDGING_COST_1);
    }

    function test_tokenDispute_roundingDustGoesToJurorFees() public {
        uint256 cost = gateway.arbitrationCost(extraData, IERC20(feeToken));
        uint256 bridgingShare = BRIDGING_COST_0 / 3; // Rounded down.
        assertEq(cost, (JUROR_COST + BRIDGING_COST_0) / 3, "cost");

        uint256 disputeID = gateway.createDispute(2, extraData, feeToken, cost);

        _assertDisputeFees(disputeID, feeToken, cost - bridgingShare, bridgingShare);
        _assertAvailable(feeToken, cost - bridgingShare, bridgingShare);
        assertEq(feeToken.balanceOf(address(gateway)), cost, "token balance");
    }

    function test_feeTokensAreAccountedSeparately() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);
        uint256 tokenCost = gateway.arbitrationCost(extraData, IERC20(feeToken));
        gateway.createDispute(2, extraData, feeToken, tokenCost);

        _assertAvailable(NATIVE_CURRENCY, JUROR_COST, BRIDGING_COST_0);
        (uint256 total, , ) = gateway.availableFees(feeToken);
        assertEq(total, tokenCost, "token total");
    }

    function test_balancesAccumulateOverDisputes() public {
        uint256 cost = gateway.arbitrationCost(extraData);
        gateway.createDispute{value: cost}(2, extraData);
        gateway.createDispute{value: cost}(2, extraData);

        _assertAvailable(NATIVE_CURRENCY, 2 * JUROR_COST, 2 * BRIDGING_COST_0);
    }

    // ************************************* //
    // *            Withdrawals            * //
    // ************************************* //

    function test_withdrawFees_paysTheKeeperAndUpdatesCounters() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);
        uint256 jurorAmount = JUROR_COST / 2;
        uint256 bridgingAmount = BRIDGING_COST_0;

        vm.expectEmit(true, true, true, true, address(gateway));
        emit FeesWithdrawn(keeper, jurorAmount, bridgingAmount, NATIVE_CURRENCY);
        vm.prank(keeper);
        gateway.withdrawFees(NATIVE_CURRENCY, jurorAmount, bridgingAmount);

        assertEq(keeper.balance, jurorAmount + bridgingAmount, "keeper balance");
        _assertAvailable(NATIVE_CURRENCY, JUROR_COST - jurorAmount, 0);
        (, , uint256 sumJurorFeesWithdrawn, uint256 sumBridgingFeesWithdrawn) = gateway.feeBalances(NATIVE_CURRENCY);
        assertEq(sumJurorFeesWithdrawn, jurorAmount, "juror withdrawn");
        assertEq(sumBridgingFeesWithdrawn, bridgingAmount, "bridging withdrawn");
    }

    function test_withdrawFees_byGovernorStillPaysTheKeeper() public {
        uint256 cost = gateway.arbitrationCost(extraData, IERC20(feeToken));
        gateway.createDispute(2, extraData, feeToken, cost);
        (, uint256 jurorFees, uint256 bridgingFees) = gateway.availableFees(feeToken);

        vm.prank(governor);
        gateway.withdrawFees(feeToken, jurorFees, bridgingFees);

        assertEq(feeToken.balanceOf(keeper), cost, "keeper balance");
        assertEq(feeToken.balanceOf(governor), 0, "governor balance");
        _assertAvailable(feeToken, 0, 0);
    }

    function test_withdrawFees_revertsAboveAvailableJurorFees() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);

        vm.prank(keeper);
        vm.expectRevert(ForeignGateway.InsufficientFees.selector);
        gateway.withdrawFees(NATIVE_CURRENCY, JUROR_COST + 1, 0);
    }

    function test_withdrawFees_cannotDrawBridgingFeesAsJurorFees() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);

        vm.prank(keeper);
        vm.expectRevert(ForeignGateway.InsufficientFees.selector);
        gateway.withdrawFees(NATIVE_CURRENCY, JUROR_COST + BRIDGING_COST_0, 0);
    }

    function test_withdrawFees_revertsAboveAvailableBridgingFees() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);

        vm.prank(keeper);
        vm.expectRevert(ForeignGateway.InsufficientFees.selector);
        gateway.withdrawFees(NATIVE_CURRENCY, 0, BRIDGING_COST_0 + 1);
    }

    function test_withdrawFees_revertsOnceWithdrawn() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);
        vm.startPrank(keeper);
        gateway.withdrawFees(NATIVE_CURRENCY, JUROR_COST, 0);

        vm.expectRevert(ForeignGateway.InsufficientFees.selector);
        gateway.withdrawFees(NATIVE_CURRENCY, 1, 0);
        vm.stopPrank();
    }

    function test_withdrawFees_onlyGovernorOrKeeper() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);

        vm.prank(other);
        vm.expectRevert(ForeignGateway.GovernorOrKeeperOnly.selector);
        gateway.withdrawFees(NATIVE_CURRENCY, 1, 0);
    }

    function test_withdrawFees_revertsWithoutKeeper() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);
        vm.startPrank(governor);
        gateway.changeKeeper(address(0));

        vm.expectRevert(ForeignGateway.KeeperNotSet.selector);
        gateway.withdrawFees(NATIVE_CURRENCY, 1, 0);
        vm.stopPrank();
    }

    function test_withdrawFees_revertsWhenTheKeeperRejectsNative() public {
        gateway.createDispute{value: gateway.arbitrationCost(extraData)}(2, extraData);
        address rejecting = address(new RejectsNative());
        vm.startPrank(governor);
        gateway.changeKeeper(rejecting);

        vm.expectRevert(ForeignGateway.TransferFailed.selector);
        gateway.withdrawFees(NATIVE_CURRENCY, 1, 0);
        vm.stopPrank();
    }

    // ************************************* //
    // *             Helpers               * //
    // ************************************* //

    function _assertDisputeFees(
        uint256 _disputeID,
        IERC20 _feeToken,
        uint256 _feesForJurors,
        uint256 _feesForBridging
    ) internal view {
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                "createDispute",
                block.chainid,
                address(gateway),
                address(this),
                _disputeID,
                uint256(2),
                extraData
            )
        );
        (, , , , IERC20 storedToken, uint256 feesForJurors, uint256 feesForBridging) = gateway.disputeHashtoDisputeData(
            disputeHash
        );
        assertEq(address(storedToken), address(_feeToken), "dispute fee token");
        assertEq(feesForJurors, _feesForJurors, "dispute juror fees");
        assertEq(feesForBridging, _feesForBridging, "dispute bridging fees");
    }

    function _assertAvailable(IERC20 _feeToken, uint256 _jurorFees, uint256 _bridgingFees) internal view {
        (uint256 total, uint256 jurorFees, uint256 bridgingFees) = gateway.availableFees(_feeToken);
        assertEq(jurorFees, _jurorFees, "available juror fees");
        assertEq(bridgingFees, _bridgingFees, "available bridging fees");
        assertEq(total, _jurorFees + _bridgingFees, "available total");
    }
}

// ************************************* //
// *     R1: vouched dispute leg       * //
// ************************************* //

/// @dev `relayDispute` dispatches through `_dispatchVouched`: the gateway's reporters accept its message and refuse
/// any other sender's, and the gateway vouches only during its own dispatch.
contract ForeignGatewayVouchedDispatchTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));

    function test_relayDispute_dispatchesVouchedThroughYaho() public {
        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 2);
        bytes32 disputeHash = _disputeHash(disputeID, extraData);
        Message memory expected = Message({
            nonce: foreignYaho.currentNonce(),
            targetChainId: block.chainid,
            threshold: 2,
            sender: address(foreignGateway),
            receiver: address(homeGateway),
            data: abi.encode(
                IForeignGateway.DisputeMessage({
                    foreignArbitrable: address(this),
                    foreignDisputeID: disputeID,
                    choices: CHOICES,
                    extraData: extraData,
                    externalDisputeID: EXTERNAL_DISPUTE_ID,
                    templateId: TEMPLATE_ID,
                    templateUri: TEMPLATE_URI,
                    oracleIDs: _ids(0, 1),
                    threshold: 2
                })
            ),
            reporters: _reporters(foreignReporters[0], foreignReporters[1]),
            adapters: _adapters(homeAdapters[0], homeAdapters[1])
        });
        bytes32 messageHash = foreignYaho.calculateMessageHash(expected);
        uint256 expectedId = foreignYaho.calculateMessageId(block.chainid, address(foreignYaho), messageHash);
        assertFalse(foreignGateway.isDispatching(messageHash), "vouched before the dispatch");

        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.DisputeRelayed(disputeHash, expectedId);
        uint256 messageId = foreignGateway.relayDispute(
            disputeID,
            CHOICES,
            extraData,
            EXTERNAL_DISPUTE_ID,
            TEMPLATE_ID,
            TEMPLATE_URI
        );

        assertEq(messageId, expectedId, "message ID");
        assertEq(foreignYaho.currentNonce(), expected.nonce + 1, "one message dispatched");
        for (uint256 i = 0; i < NB_ORACLES; i++) {
            assertEq(foreignReporters[i].dispatchCount(), 1, "dispatch count");
            assertEq(foreignReporters[i].lastTargetChainId(), block.chainid, "target chain");
            assertEq(address(foreignReporters[i].lastAdapter()), address(homeAdapters[i]), "adapter");
            _assertReported(foreignReporters[i], foreignYaho, messageId, expected);
        }
        assertFalse(foreignGateway.isDispatching(messageHash), "vouched after the dispatch");
    }

    function test_relayDispute_defaultSelection() public {
        uint256 disputeID = foreignGateway.createDispute{value: foreignGateway.arbitrationCost(extraData)}(
            CHOICES,
            extraData
        );
        (uint256 messageId, Message memory message) = _relay(disputeID, extraData);

        _assertReported(foreignReporters[0], foreignYaho, messageId, message);
        assertEq(foreignReporters[1].dispatchCount(), 0, "unselected reporter");
        assertEq(message.reporters.length, 1, "reporters");
        assertEq(message.threshold, 1, "threshold");
    }

    function test_directDispatchWithTheGatewayReporters_reverts() public {
        IReporter[] memory reporters = _reporters(foreignReporters[0], foreignReporters[1]);
        IAdapter[] memory adapters = _adapters(homeAdapters[0], homeAdapters[1]);
        bytes memory data = "forged dispute";
        Message memory forged = Message(
            foreignYaho.currentNonce(),
            block.chainid,
            1,
            other,
            address(homeGateway),
            data,
            reporters,
            adapters
        );
        bytes32 forgedHash = foreignYaho.calculateMessageHash(forged);

        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(VouchingReporter.NotVouched.selector, forgedHash));
        foreignYaho.dispatchMessageToAdapters(block.chainid, 1, address(homeGateway), data, reporters, adapters);
    }

    function test_selfVouchingDispatcher_cannotUseTheGatewayReporters() public {
        SelfVouchingDispatcher attacker = new SelfVouchingDispatcher(address(foreignYaho));
        IReporter[] memory reporters = _reporters(foreignReporters[0], foreignReporters[1]);
        IAdapter[] memory adapters = _adapters(homeAdapters[0], homeAdapters[1]);
        bytes memory data = "forged dispute";
        Message memory forged = Message(
            foreignYaho.currentNonce(),
            block.chainid,
            1,
            address(attacker),
            address(homeGateway),
            data,
            reporters,
            adapters
        );

        vm.expectRevert(
            abi.encodeWithSelector(VouchingReporter.NotVouched.selector, foreignYaho.calculateMessageHash(forged))
        );
        attacker.dispatch(block.chainid, 1, address(homeGateway), data, reporters, adapters);
    }

    function test_isDispatching_falseOutsideADispatch() public {
        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 1);
        (, Message memory message) = _relay(disputeID, extraData);

        assertFalse(foreignGateway.isDispatching(foreignYaho.calculateMessageHash(message)), "dispatched hash");
        assertFalse(foreignGateway.isDispatching(bytes32(0)), "zero hash");
    }
}

// ************************************* //
// *   R2: court resolution, strict    * //
// ************************************* //

/// @dev With the rate at 1e18, no bridging cost and the mirrored fees equal to the ruler's, the ForeignGateway charges
/// exactly KlerosCoreRuler's `arbitrationCost`, or reverts `CourtNotSupported` where the ruler would fall back.
contract ForeignGatewayCourtTest is GatewayHarness {
    TestERC20 internal feeToken;

    function setUp() public override {
        super.setUp();
        feeToken = new TestERC20("Test", "TST");
        vm.startPrank(governor);
        foreignGateway.changeAcceptedFeeTokens(feeToken, true);
        foreignGateway.changeCurrencyRates(feeToken, 1, 0); // 1 token unit per native unit.
        vm.stopPrank();
        feeToken.approve(address(foreignGateway), type(uint256).max);
    }

    function test_parity_shortExtraDataUsesTheGeneralCourt() public {
        uint256 expected = GENERAL_FEE * DEFAULT_NB_OF_JURORS;
        _assertParity("", expected);
        _assertParity(abi.encode(uint256(MIRRORED_COURT)), expected);
        _assertParity(abi.encodePacked(uint256(MIRRORED_COURT), bytes31(uint248(7))), expected); // 63 bytes.
    }

    function test_parity_forkingCourtUsesTheGeneralCourt() public {
        _assertParity(abi.encode(uint256(FORKING_COURT), uint256(5)), GENERAL_FEE * 5);
    }

    function test_parity_generalCourt() public {
        _assertParity(abi.encode(uint256(GENERAL_COURT), uint256(4)), GENERAL_FEE * 4);
    }

    function test_parity_mirroredCourt() public {
        _assertParity(abi.encode(uint256(MIRRORED_COURT), uint256(7)), MIRRORED_COURT_FEE * 7);
        _assertParity(abi.encode(uint256(MIRRORED_COURT), uint256(7), uint256(1)), MIRRORED_COURT_FEE * 7);
    }

    function test_parity_zeroJurorsUseTheDefault() public {
        _assertParity(abi.encode(uint256(MIRRORED_COURT), uint256(0)), MIRRORED_COURT_FEE * DEFAULT_NB_OF_JURORS);
        _assertParity(abi.encode(uint256(FORKING_COURT), uint256(0)), GENERAL_FEE * DEFAULT_NB_OF_JURORS);
    }

    function test_unmirroredExistingCourt_reverts() public {
        bytes memory data = abi.encode(uint256(UNMIRRORED_COURT), uint256(3));
        assertEq(ruler.arbitrationCost(data), UNMIRRORED_COURT_FEE * 3, "the court exists on the ruler");
        _assertCourtNotSupported(data, UNMIRRORED_COURT);
    }

    function test_nonexistentCourt_reverts() public {
        bytes memory data = abi.encode(uint256(99), uint256(3));
        assertEq(ruler.arbitrationCost(data), GENERAL_FEE * 3, "the ruler falls back to the general court");
        _assertCourtNotSupported(data, 99);
    }

    function test_unmirroredGeneralCourt_reverts() public {
        vm.prank(governor);
        foreignGateway.changeCourtJurorFee(GENERAL_COURT, 0);

        _assertCourtNotSupported("", GENERAL_COURT);
        _assertCourtNotSupported(abi.encode(uint256(MIRRORED_COURT)), GENERAL_COURT);
        _assertCourtNotSupported(abi.encode(uint256(FORKING_COURT), uint256(3)), GENERAL_COURT);
        _assertCourtNotSupported(abi.encode(uint256(GENERAL_COURT), uint256(3)), GENERAL_COURT);
        _assertParity(abi.encode(uint256(MIRRORED_COURT), uint256(3)), MIRRORED_COURT_FEE * 3);
    }

    /// @dev The ruler reads the court word into a uint96 without cleaning it: for an existing court it panics, so the
    /// HomeGateway could never create the dispute. The gateway reverts before taking any fee.
    function test_courtWordWiderThanUint96_reverts() public {
        uint96[2] memory courts = [GENERAL_COURT, MIRRORED_COURT];
        for (uint256 i = 0; i < courts.length; i++) {
            bytes memory data = abi.encode((uint256(1) << 96) | courts[i], uint256(3));
            vm.expectRevert(stdError.indexOOBError);
            ruler.arbitrationCost(data);
            _assertCourtNotSupported(data, type(uint96).max);
        }
        _assertCourtNotSupported(abi.encode(type(uint256).max, uint256(3)), type(uint96).max);
    }

    /// @dev [L2], accepted deviation: a court word wider than uint96 whose low 96 bits are 0 resolves to the general
    /// court on the ruler, which charges its fee, but the gateway refuses it as not a valid uint96 encoding.
    function test_courtWordWiderThanUint96_lowBitsZero_deviatesFromTheRuler() public {
        bytes memory data = abi.encode(uint256(1) << 96, uint256(3));
        assertEq(ruler.arbitrationCost(data), GENERAL_FEE * 3, "the ruler charges the general court");
        _assertCourtNotSupported(data, type(uint96).max);
    }

    /// @dev Any court word: the gateway charges the ruler's cost, or reverts for a court it does not mirror or a word
    /// wider than uint96.
    function testFuzz_parity(uint256 _highBits, uint8 _court, uint256 _minJurors) public view {
        _minJurors = bound(_minJurors, 0, type(uint32).max);
        uint96 courtID = uint96(_court % 5);
        uint256 courtWord = (_highBits << 96) | courtID;
        bytes memory data = abi.encode(courtWord, _minJurors);
        uint96 resolved = courtID == FORKING_COURT ? GENERAL_COURT : courtID;
        if (courtWord > type(uint96).max) resolved = type(uint96).max;

        if (resolved == GENERAL_COURT || resolved == MIRRORED_COURT) {
            assertEq(foreignGateway.arbitrationCost(data), ruler.arbitrationCost(data), "parity");
        } else {
            try foreignGateway.arbitrationCost(data) returns (uint256) {
                revert("Unsupported court charged");
            } catch (bytes memory err) {
                assertEq(err, abi.encodeWithSelector(ForeignGateway.CourtNotSupported.selector, resolved), "error");
            }
        }
    }

    /// @dev Every cost view equals `_expected`, and `createDispute` takes exactly `_expected`.
    function _assertParity(bytes memory _extraData, uint256 _expected) internal {
        assertEq(foreignGateway.bridgingCost(_ids(0, 1)), 0, "bridging cost");
        assertEq(ruler.arbitrationCost(_extraData), _expected, "ruler cost");
        assertEq(foreignGateway.arbitrationCost(_extraData), _expected, "gateway cost");
        assertEq(foreignGateway.arbitrationCost(_extraData, _ids(0, 1)), _expected, "gateway cost, selected oracles");
        assertEq(foreignGateway.arbitrationCost(_extraData, IERC20(feeToken)), _expected, "gateway cost in token");

        vm.expectRevert(ForeignGateway.ArbitrationFeesNotEnough.selector);
        foreignGateway.createDispute{value: _expected - 1}(CHOICES, _extraData);
        (, uint256 jurorFeesBefore, ) = foreignGateway.availableFees(NATIVE_CURRENCY);
        foreignGateway.createDispute{value: _expected}(CHOICES, _extraData);
        (, uint256 jurorFeesAfter, ) = foreignGateway.availableFees(NATIVE_CURRENCY);
        assertEq(jurorFeesAfter - jurorFeesBefore, _expected, "juror fees taken");
    }

    /// @dev Every cost view and every `createDispute` overload reverts `CourtNotSupported(_courtID)`.
    function _assertCourtNotSupported(bytes memory _extraData, uint96 _courtID) internal {
        bytes memory err = abi.encodeWithSelector(ForeignGateway.CourtNotSupported.selector, _courtID);
        uint256[] memory ids = _ids(0, 1);
        vm.expectRevert(err);
        foreignGateway.arbitrationCost(_extraData);
        vm.expectRevert(err);
        foreignGateway.arbitrationCost(_extraData, ids);
        vm.expectRevert(err);
        foreignGateway.arbitrationCost(_extraData, IERC20(feeToken));
        vm.expectRevert(err);
        foreignGateway.arbitrationCost(_extraData, ids, IERC20(feeToken));
        vm.expectRevert(err);
        foreignGateway.createDispute{value: 10 ether}(CHOICES, _extraData);
        vm.expectRevert(err);
        foreignGateway.createDispute{value: 10 ether}(CHOICES, _extraData, ids, 1);
        vm.expectRevert(err);
        foreignGateway.createDispute(CHOICES, _extraData, feeToken, 10 ether);
        vm.expectRevert(err);
        foreignGateway.createDispute(CHOICES, _extraData, ids, 1, feeToken, 10 ether);
    }
}

// ************************************* //
// *     R3, R6: governance setters    * //
// ************************************* //

contract ForeignGatewaySettersTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));
    uint256 internal constant JUROR_COST = MIRRORED_COURT_FEE * 3;

    // changeYaho, changeYaru

    function test_changeYaho_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(ForeignGateway.GovernorOnly.selector);
        foreignGateway.changeYaho(IYaho(address(1)));
    }

    function test_changeYaho_setsTheYahoUsedByRelayDispute() public {
        Yaho newYaho = new Yaho();
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.YahoChanged(IYaho(address(newYaho)));
        vm.prank(governor);
        foreignGateway.changeYaho(IYaho(address(newYaho)));
        assertEq(address(foreignGateway.yaho()), address(newYaho), "yaho");

        VouchingReporter newReporter = new VouchingReporter(address(newYaho));
        newReporter.setDispatcher(address(foreignGateway));
        vm.prank(governor);
        foreignGateway.setOracleReporter(0, newReporter);
        uint256 disputeID = foreignGateway.createDispute{value: JUROR_COST}(CHOICES, extraData);
        vm.recordLogs();
        foreignGateway.relayDispute(disputeID, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, TEMPLATE_URI);
        (uint256 messageId, Message memory message) = _dispatchedMessage(newYaho);

        _assertReported(newReporter, newYaho, messageId, message);
        assertEq(foreignYaho.currentNonce(), 0, "old Yaho unused");
    }

    function test_changeYaru_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(ForeignGateway.GovernorOnly.selector);
        foreignGateway.changeYaru(other);
    }

    function test_changeYaru_setsTheOnlyAllowedCaller() public {
        address newYaru = makeAddr("newYaru");
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.YaruChanged(newYaru);
        vm.prank(governor);
        foreignGateway.changeYaru(newYaru);
        assertEq(foreignGateway.yaru(), newYaru, "yaru");

        vm.prank(foreignYaru);
        vm.expectRevert(ForeignGateway.YaruOnly.selector);
        foreignGateway.onMessage(0, block.chainid, address(homeGateway), 1, new IAdapter[](0), "");
        vm.prank(newYaru);
        vm.expectRevert(ForeignGateway.DisputeDoesNotExist.selector); // Past the Yaru check.
        foreignGateway.onMessage(
            0,
            block.chainid,
            address(homeGateway),
            1,
            new IAdapter[](0),
            abi.encode(bytes32(0), uint256(1))
        );
    }

    // setOracleEnabled

    function test_setOracleEnabled_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(ForeignGateway.GovernorOnly.selector);
        foreignGateway.setOracleEnabled(1, false);
        vm.prank(keeper);
        vm.expectRevert(ForeignGateway.GovernorOnly.selector);
        foreignGateway.setOracleEnabled(1, false);
    }

    function test_setOracleEnabled_unknownOracle_reverts() public {
        vm.startPrank(governor);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.UnknownOracle.selector, NB_ORACLES));
        foreignGateway.setOracleEnabled(NB_ORACLES, false);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.UnknownOracle.selector, NB_ORACLES));
        foreignGateway.setOracleEnabled(NB_ORACLES, true);
        vm.stopPrank();
    }

    function test_setOracleEnabled_disablesAndEmits() public {
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.OracleEnabled(1, false);
        vm.prank(governor);
        foreignGateway.setOracleEnabled(1, false);

        (, , , bool enabled) = foreignGateway.oracles(1);
        assertFalse(enabled, "enabled");
    }

    function test_setOracleEnabled_cannotDisableADefaultOracle() public {
        vm.startPrank(governor);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.OracleInDefaultSelection.selector, 0));
        foreignGateway.setOracleEnabled(0, false);
        foreignGateway.setOracleEnabled(0, true); // Enabling is always allowed.

        foreignGateway.setDefaultOracles(_ids(1), 1);
        foreignGateway.setOracleEnabled(0, false);
        vm.stopPrank();
        (, , , bool enabled) = foreignGateway.oracles(0);
        assertFalse(enabled, "disabled once out of the default selection");
    }

    function test_disabledOracle_cannotBeSelected() public {
        TestERC20 feeToken = _acceptToken();
        vm.startPrank(governor);
        foreignGateway.setOracleEnabled(1, false);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.OracleNotEnabled.selector, 1));
        foreignGateway.setDefaultOracles(_ids(0, 1), 1);
        vm.stopPrank();

        uint256[] memory ids = _ids(0, 1);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.OracleNotEnabled.selector, 1));
        foreignGateway.createDispute{value: JUROR_COST}(CHOICES, extraData, ids, 1);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.OracleNotEnabled.selector, 1));
        foreignGateway.createDispute(CHOICES, extraData, ids, 1, feeToken, JUROR_COST);
    }

    function test_reenabledOracle_canBeSelectedAgain() public {
        vm.startPrank(governor);
        foreignGateway.setOracleEnabled(1, false);
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.OracleEnabled(1, true);
        foreignGateway.setOracleEnabled(1, true);
        vm.stopPrank();

        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 2);
        assertEq(foreignGateway.getDisputeOracles(_disputeHash(disputeID, extraData)).oracleIDs.length, 2, "selected");
    }

    function test_disabledOracle_existingDisputeKeepsItsSnapshot() public {
        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 2);
        bytes32 disputeHash = _disputeHash(disputeID, extraData);
        vm.prank(governor);
        foreignGateway.setOracleEnabled(1, false);

        ForeignGateway.OracleSelection memory selection = foreignGateway.getDisputeOracles(disputeHash);
        assertEq(selection.oracleIDs, _ids(0, 1), "snapshot oracles");
        assertEq(selection.threshold, 2, "snapshot threshold");

        (uint256 messageId, Message memory message) = _relay(disputeID, extraData);
        _assertReported(foreignReporters[0], foreignYaho, messageId, message);
        _assertReported(foreignReporters[1], foreignYaho, messageId, message);
        uint256 homeDisputeID = ruler.getNextDisputeID();
        _deliver(homeYaru, foreignYaho, messageId, message);
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "received on the home chain");
    }

    // setOracleBridgingCost

    function test_setOracleBridgingCost_unknownOracle_reverts() public {
        vm.prank(governor);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.UnknownOracle.selector, NB_ORACLES));
        foreignGateway.setOracleBridgingCost(NB_ORACLES, 1);
        vm.prank(keeper);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.UnknownOracle.selector, NB_ORACLES));
        foreignGateway.setOracleBridgingCost(NB_ORACLES, 1);
    }

    function test_setOracleBridgingCost_worksOnADisabledOracle() public {
        uint256 cost = 0.004 ether;
        vm.startPrank(governor);
        foreignGateway.setOracleEnabled(1, false);
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.OracleBridgingCostSet(1, cost);
        foreignGateway.setOracleBridgingCost(1, cost);
        assertEq(foreignGateway.oracleBridgingCost(1), cost, "cost");

        // Its cost applies again once it is enabled again.
        foreignGateway.setOracleEnabled(1, true);
        vm.stopPrank();
        assertEq(foreignGateway.arbitrationCost(extraData, _ids(0, 1)), JUROR_COST + cost, "arbitration cost");
        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 1);
        (, , , , , uint256 feesForJurors, uint256 feesForBridging) = foreignGateway.disputeHashtoDisputeData(
            _disputeHash(disputeID, extraData)
        );
        assertEq(feesForJurors, JUROR_COST, "juror fees");
        assertEq(feesForBridging, cost, "bridging fees");
    }

    // changeAcceptedFeeTokens (R6)

    function test_changeAcceptedFeeTokens_onlyGovernor() public {
        TestERC20 token = new TestERC20("Test", "TST");
        vm.prank(other);
        vm.expectRevert(ForeignGateway.GovernorOnly.selector);
        foreignGateway.changeAcceptedFeeTokens(token, true);
    }

    function test_changeAcceptedFeeTokens_rejectsNativeCurrency() public {
        vm.prank(governor);
        vm.expectRevert(ForeignGateway.InvalidFeeToken.selector);
        foreignGateway.changeAcceptedFeeTokens(NATIVE_CURRENCY, true);
    }

    function test_changeAcceptedFeeTokens_rejectsAnAddressWithoutCode() public {
        IERC20 eoa = IERC20(makeAddr("eoa"));
        vm.prank(governor);
        vm.expectRevert(ForeignGateway.InvalidFeeToken.selector);
        foreignGateway.changeAcceptedFeeTokens(eoa, true);
        (bool accepted, , ) = foreignGateway.currencyRates(eoa);
        assertFalse(accepted, "accepted");
    }

    function test_changeAcceptedFeeTokens_disablingANonContractIsAllowed() public {
        IERC20 eoa = IERC20(makeAddr("eoa"));
        vm.startPrank(governor);
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit IArbitratorV2.AcceptedFeeToken(eoa, false);
        foreignGateway.changeAcceptedFeeTokens(eoa, false);
        foreignGateway.changeAcceptedFeeTokens(NATIVE_CURRENCY, false);
        vm.stopPrank();
    }

    function test_changeAcceptedFeeTokens_acceptsAnERC20() public {
        TestERC20 token = _acceptToken();
        (bool accepted, , ) = foreignGateway.currencyRates(token);
        assertTrue(accepted, "accepted");

        uint256 cost = foreignGateway.arbitrationCost(extraData, IERC20(token));
        foreignGateway.createDispute(CHOICES, extraData, token, cost);
        assertEq(token.balanceOf(address(foreignGateway)), cost, "fees paid in the token");
    }

    function _acceptToken() internal returns (TestERC20 token) {
        token = new TestERC20("Test", "TST");
        vm.startPrank(governor);
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit IArbitratorV2.AcceptedFeeToken(token, true);
        foreignGateway.changeAcceptedFeeTokens(token, true);
        foreignGateway.changeCurrencyRates(token, 1, 0);
        vm.stopPrank();
        token.approve(address(foreignGateway), type(uint256).max);
    }
}

// ************************************* //
// *  R4: replaceable, muted reporters * //
// ************************************* //

/// @dev `setOracleReporter` on the dispute leg. The recovery tests select 2 oracles with a threshold of 1, so the
/// muted oracle's adapter is not needed for delivery.
contract ForeignGatewayReporterTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));

    function test_setOracleReporter_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(ForeignGateway.GovernorOnly.selector);
        foreignGateway.setOracleReporter(0, IReporter(address(0)));
        vm.prank(keeper);
        vm.expectRevert(ForeignGateway.GovernorOnly.selector);
        foreignGateway.setOracleReporter(0, IReporter(address(0)));
    }

    function test_setOracleReporter_unknownOracle_reverts() public {
        vm.prank(governor);
        vm.expectRevert(abi.encodeWithSelector(ForeignGateway.UnknownOracle.selector, NB_ORACLES));
        foreignGateway.setOracleReporter(NB_ORACLES, foreignReporters[0]);
    }

    function test_setOracleReporter_setsAndEmits() public {
        IReporter reporter = new VouchingReporter(address(foreignYaho));
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.OracleReporterSet(1, reporter);
        vm.prank(governor);
        foreignGateway.setOracleReporter(1, reporter);

        (IReporter stored, IAdapter outboundAdapter, IAdapter inboundAdapter, bool enabled) = foreignGateway.oracles(1);
        assertEq(address(stored), address(reporter), "reporter");
        assertEq(address(outboundAdapter), address(homeAdapters[1]), "outbound adapter unchanged");
        assertEq(address(inboundAdapter), address(foreignAdapters[1]), "inbound adapter unchanged");
        assertTrue(enabled, "enabled unchanged");
    }

    function test_setOracleReporter_acceptsZero() public {
        vm.expectEmit(true, true, true, true, address(foreignGateway));
        emit ForeignGateway.OracleReporterSet(0, IReporter(address(0)));
        vm.prank(governor);
        foreignGateway.setOracleReporter(0, IReporter(address(0)));

        (IReporter stored, , , ) = foreignGateway.oracles(0);
        assertEq(address(stored), address(0), "reporter");
    }

    function test_revertingReporter_blocksRelayDispute() public {
        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 1);
        _breakReporter(0);

        vm.expectRevert(RevertingReporter.ReporterDown.selector);
        foreignGateway.relayDispute(disputeID, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, TEMPLATE_URI);
        (, , , bool relayed, , , ) = foreignGateway.disputeHashtoDisputeData(_disputeHash(disputeID, extraData));
        assertFalse(relayed, "relayed");
    }

    function test_mutedReporter_relaySucceedsAndTheHomeGatewayAcceptsIt() public {
        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 1);
        _breakReporter(0);
        vm.expectRevert(RevertingReporter.ReporterDown.selector);
        foreignGateway.relayDispute(disputeID, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, TEMPLATE_URI);

        vm.prank(governor);
        foreignGateway.setOracleReporter(0, IReporter(address(0)));
        (uint256 messageId, Message memory message) = _relay(disputeID, extraData);

        assertEq(address(message.reporters[0]), address(0), "muted reporter");
        assertEq(address(message.reporters[1]), address(foreignReporters[1]), "working reporter");
        assertEq(address(message.adapters[0]), address(homeAdapters[0]), "muted oracle's adapter kept");
        assertEq(message.threshold, 1, "threshold");
        _assertReported(foreignReporters[1], foreignYaho, messageId, message);

        bytes32 disputeHash = _disputeHash(disputeID, extraData);
        uint256 homeDisputeID = ruler.getNextDisputeID();
        _deliver(homeYaru, foreignYaho, messageId, message);
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "received on the home chain");
    }

    function test_replacedReporter_isUsed() public {
        uint256 disputeID = _createDispute(extraData, _ids(0, 1), 1);
        _breakReporter(0);
        vm.expectRevert(RevertingReporter.ReporterDown.selector);
        foreignGateway.relayDispute(disputeID, CHOICES, extraData, EXTERNAL_DISPUTE_ID, TEMPLATE_ID, TEMPLATE_URI);

        VouchingReporter replacement = new VouchingReporter(address(foreignYaho));
        replacement.setDispatcher(address(foreignGateway));
        vm.prank(governor);
        foreignGateway.setOracleReporter(0, replacement);
        (uint256 messageId, Message memory message) = _relay(disputeID, extraData);

        assertEq(address(message.reporters[0]), address(replacement), "replacement in the message");
        _assertReported(replacement, foreignYaho, messageId, message);
        assertEq(replacement.dispatchCount(), 1, "replacement used");
        assertEq(foreignReporters[0].dispatchCount(), 0, "replaced reporter unused");
    }

    function _breakReporter(uint256 _oracleID) internal {
        IReporter reporter = new RevertingReporter();
        vm.prank(governor);
        foreignGateway.setOracleReporter(_oracleID, reporter);
    }
}

contract RejectsNative {}
