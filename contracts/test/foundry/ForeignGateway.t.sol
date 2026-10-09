// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
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

contract RejectsNative {}
