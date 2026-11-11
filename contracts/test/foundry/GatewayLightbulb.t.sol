// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {GatewayLightbulb} from "../../src/gateway/mock/GatewayLightbulb.sol";
import {ForeignGateway} from "../../src/gateway/ForeignGateway.sol";
import {IForeignGateway} from "../../src/gateway/interfaces/IForeignGateway.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {GatewayHarness} from "./gateway/GatewayHarness.sol";

/// @dev `transferFrom` from `failFrom` fails on demand, by returning false or reverting with no data.
contract FailingToken is TestERC20 {
    enum Failure {
        None,
        ReturnFalse,
        RevertEmpty
    }

    address public failFrom;
    Failure public transferFromFailure;

    constructor() TestERC20("Failing", "FAIL") {}

    function setTransferFromFailure(address _from, Failure _failure) external {
        failFrom = _from;
        transferFromFailure = _failure;
    }

    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool) {
        if (_from == failFrom && _fail(transferFromFailure)) return false;
        return super.transferFrom(_from, _to, _value);
    }

    function _fail(Failure _failure) internal pure returns (bool) {
        if (_failure == Failure.RevertEmpty) {
            assembly ("memory-safe") {
                revert(0, 0)
            }
        }
        return _failure == Failure.ReturnFalse;
    }
}

/// @dev A lightbulb owner that is a contract without a payable receive.
contract LightbulbOwner {
    GatewayLightbulb internal immutable lightbulb;

    constructor(GatewayLightbulb _lightbulb) {
        lightbulb = _lightbulb;
    }

    function requestSwitch() external payable returns (uint256) {
        return lightbulb.requestSwitch{value: msg.value}();
    }

    function claimRefundTo(uint256 _disputeID, address _beneficiary) external {
        lightbulb.claimRefundTo(_disputeID, _beneficiary);
    }
}

contract GatewayLightbulbTest is GatewayHarness {
    bytes internal extraData = abi.encode(uint256(MIRRORED_COURT), uint256(3));
    GatewayLightbulb internal lightbulb;
    address internal owner = makeAddr("owner");
    uint256 internal cost;

    function setUp() public override {
        super.setUp();
        lightbulb = new GatewayLightbulb(IForeignGateway(address(foreignGateway)), extraData, 0, "");
        cost = foreignGateway.arbitrationCost(extraData);
        vm.deal(owner, 1 ether);
    }

    function _request() internal returns (uint256 disputeID) {
        vm.prank(owner);
        disputeID = lightbulb.requestSwitch{value: cost}();
    }

    /// @dev Requests through `_owner`, has the home chain fail the dispute and gives the failure to the lightbulb.
    function _failedRequest(LightbulbOwner _owner) internal returns (uint256 disputeID) {
        vm.recordLogs();
        disputeID = _owner.requestSwitch{value: cost}();
        (uint256 disputeMessageId, Message memory disputeMessage) = _dispatchedMessage(foreignYaho);
        _deliver(homeYaru, foreignYaho, disputeMessageId, disputeMessage);
        (uint256 failureId, Message memory failure) = _sendCreationFailure(foreignGateway.disputeIDtoHash(disputeID));
        _deliver(foreignYaru, homeYaho, failureId, failure);
        _executeRuling(disputeID);
    }

    function test_rule_andFailure_onlyFromTheGateway() public {
        uint256 disputeID = _request();
        vm.startPrank(other);
        vm.expectRevert(GatewayLightbulb.GatewayOnly.selector);
        lightbulb.rule(disputeID, 1);
        vm.expectRevert(GatewayLightbulb.GatewayOnly.selector);
        lightbulb.onDisputeCreationFailed(disputeID);
        vm.stopPrank();
        assertFalse(lightbulb.lightbulbIsOn(owner), "not switched");
    }

    function test_rule_andFailure_unknownDispute_revert() public {
        vm.startPrank(address(foreignGateway));
        vm.expectRevert(GatewayLightbulb.UnknownDispute.selector);
        lightbulb.rule(999, 1);
        vm.expectRevert(GatewayLightbulb.UnknownDispute.selector);
        lightbulb.onDisputeCreationFailed(999);
        vm.stopPrank();
    }

    function test_rule_andFailure_afterARuling_revert() public {
        uint256 disputeID = _request();
        vm.startPrank(address(foreignGateway));
        lightbulb.rule(disputeID, 1);
        assertTrue(lightbulb.lightbulbIsOn(owner), "switched on");
        vm.expectRevert(GatewayLightbulb.AlreadyRuled.selector);
        lightbulb.rule(disputeID, 2);
        vm.expectRevert(GatewayLightbulb.AlreadyRuled.selector);
        lightbulb.onDisputeCreationFailed(disputeID);
        vm.stopPrank();
        assertTrue(lightbulb.lightbulbIsOn(owner), "still on");
    }

    function test_requestSwitch_insufficientPayment_reverts() public {
        vm.startPrank(owner);
        vm.expectRevert(GatewayLightbulb.InsufficientPayment.selector);
        lightbulb.requestSwitch{value: cost - 1}();
        uint256 selectedCost = foreignGateway.arbitrationCost(extraData, _ids(0, 1));
        vm.expectRevert(GatewayLightbulb.InsufficientPayment.selector);
        lightbulb.requestSwitch{value: selectedCost - 1}(_ids(0, 1), 2);
        vm.stopPrank();
    }

    function test_requestSwitch_refundsTheExcess_orReverts() public {
        vm.prank(owner);
        lightbulb.requestSwitch{value: cost + 1}();
        assertEq(owner.balance, 1 ether - cost, "excess refunded");

        LightbulbOwner contractOwner = new LightbulbOwner(lightbulb);
        vm.expectRevert(GatewayLightbulb.RefundFailed.selector);
        contractOwner.requestSwitch{value: cost + 1}();
    }

    /// @dev Accepts a `FailingToken` on the gateway and approves the cost to the lightbulb.
    function _failingToken() internal returns (FailingToken token, uint256 tokenCost) {
        token = new FailingToken();
        vm.startPrank(governor);
        foreignGateway.changeAcceptedFeeTokens(IERC20(address(token)), true);
        foreignGateway.changeCurrencyRates(IERC20(address(token)), 1, 0);
        vm.stopPrank();
        tokenCost = foreignGateway.arbitrationCost(extraData, IERC20(address(token)));
        token.approve(address(lightbulb), tokenCost);
    }

    /// @dev A failed pull from the caller reverts, even though the lightbulb holds enough tokens to pay the gateway.
    function test_requestSwitchWithToken_pullFails_reverts() public {
        (FailingToken token, uint256 tokenCost) = _failingToken();
        token.transfer(address(lightbulb), tokenCost);

        token.setTransferFromFailure(address(this), FailingToken.Failure.ReturnFalse);
        vm.expectRevert(GatewayLightbulb.TransferFailed.selector);
        lightbulb.requestSwitchWithToken(IERC20(address(token)));
        token.setTransferFromFailure(address(this), FailingToken.Failure.RevertEmpty);
        vm.expectRevert(GatewayLightbulb.TransferFailed.selector);
        lightbulb.requestSwitchWithToken(IERC20(address(token)));
    }

    /// @dev An owner that cannot receive native currency names another beneficiary; only the owner can.
    function test_claimRefund_toABeneficiaryOfTheOwner() public {
        LightbulbOwner contractOwner = new LightbulbOwner(lightbulb);
        uint256 disputeID = _failedRequest(contractOwner);
        vm.expectRevert(ForeignGateway.TransferFailed.selector);
        lightbulb.claimRefund(disputeID);

        address beneficiary = makeAddr("beneficiary");
        vm.prank(other);
        vm.expectRevert(GatewayLightbulb.OwnerOnly.selector);
        lightbulb.claimRefundTo(disputeID, other);

        contractOwner.claimRefundTo(disputeID, beneficiary);
        assertEq(beneficiary.balance, cost, "juror fees refunded");
    }
}
