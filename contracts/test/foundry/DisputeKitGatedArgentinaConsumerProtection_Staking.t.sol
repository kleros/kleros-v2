// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitGatedArgentinaConsumerProtectionMock} from "../../src/test/DisputeKitGatedArgentinaConsumerProtectionMock.sol";
import {ICourtEligibility} from "../../src/arbitration/interfaces/ICourtEligibility.sol";
import {TestERC721} from "../../src/token/TestERC721.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import "../../src/libraries/Constants.sol";

/// @title DisputeKitGatedArgentinaConsumerProtection_StakingTest
/// @dev Tests for ICourtEligibility enforcement during staking via DisputeKitGatedArgentinaConsumerProtection
contract DisputeKitGatedArgentinaConsumerProtection_StakingTest is KlerosCore_TestBase {
    // ************************************* //
    // *          Test Contracts           * //
    // ************************************* //

    DisputeKitGatedArgentinaConsumerProtectionMock argentinaDK;
    TestERC721 accreditedProfessionalToken;
    TestERC721 accreditedConsumerProtectionLawyerToken;

    // ************************************* //
    // *            Test Accounts          * //
    // ************************************* //

    address eligibleLawyer; // Has only accredited professional token
    address eligibleConsumerLawyer; // Has only consumer protection lawyer token
    address eligibleBothLawyer; // Has both tokens
    address ineligibleJuror; // Has no tokens

    // ************************************* //
    // *         Test Parameters           * //
    // ************************************* //

    uint96 argentinaCourt;
    uint256 constant ARGENTINA_DK_ID = 2;
    uint256 maxExtraFilteringAttempts = 5;

    function setUp() public override {
        super.setUp();

        // Set up test accounts
        eligibleLawyer = vm.addr(10);
        eligibleConsumerLawyer = vm.addr(11);
        eligibleBothLawyer = vm.addr(12);
        ineligibleJuror = vm.addr(13);

        // Deploy token contracts
        accreditedProfessionalToken = new TestERC721("Accredited Lawyer", "AL");
        accreditedConsumerProtectionLawyerToken = new TestERC721("Consumer Protection Lawyer", "CPL");

        // Mint tokens to eligible jurors
        accreditedProfessionalToken.safeMint(eligibleLawyer);
        accreditedConsumerProtectionLawyerToken.safeMint(eligibleConsumerLawyer);
        accreditedProfessionalToken.safeMint(eligibleBothLawyer);
        accreditedConsumerProtectionLawyerToken.safeMint(eligibleBothLawyer);

        // Deploy and initialize the Argentina dispute kit
        DisputeKitGatedArgentinaConsumerProtectionMock dkLogic = new DisputeKitGatedArgentinaConsumerProtectionMock();
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,address,address)",
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC,
            maxExtraFilteringAttempts,
            address(accreditedProfessionalToken),
            address(accreditedConsumerProtectionLawyerToken)
        );
        TransparentUpgradeableProxy proxyDK = new TransparentUpgradeableProxy(address(dkLogic), owner, initData);
        argentinaDK = DisputeKitGatedArgentinaConsumerProtectionMock(address(proxyDK));

        // Add the dispute kit to core
        vm.prank(owner);
        core.addNewDisputeKit(argentinaDK);

        // Create a court with the Argentina DK as the eligibility predicate
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = ARGENTINA_DK_ID;

        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            false, // hiddenVotes
            1000, // minStake
            10000, // alpha
            0.03 ether, // feeForJuror
            50, // jurorsForJump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // timesPerPeriod
            supportedDK,
            ICourtEligibility(address(argentinaDK)) // eligibility predicate
        );

        argentinaCourt = core.getLatestCourtID();

        // Give PNK to all test jurors and approve core
        address[4] memory jurors = [eligibleLawyer, eligibleConsumerLawyer, eligibleBothLawyer, ineligibleJuror];
        for (uint256 i = 0; i < jurors.length; i++) {
            vm.prank(owner);
            pinakion.transfer(jurors[i], 5000);
            vm.startPrank(jurors[i]);
            pinakion.approve(address(core), 5000);
            core.depositTokens(5000);
            vm.stopPrank();
        }
    }

    // ************************************* //
    // *              Tests                * //
    // ************************************* //

    /// @notice Juror holding only the accredited professional token can stake
    function test_stakeSucceedsWithAccreditedProfessionalToken() public {
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = eligibleLawyer;
        courtIDs[0] = argentinaCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (uint256 totalStaked, ) = sortitionModule.getJurorBalance(eligibleLawyer);
        uint256 stakedInCourt = sortitionModule.stakeOf(eligibleLawyer, argentinaCourt);

        assertEq(stakedInCourt, 3000, "Wrong staked amount");
        assertEq(totalStaked, 3000, "Wrong total staked");
    }

    /// @notice Juror holding only the consumer protection lawyer token can stake
    function test_stakeSucceedsWithConsumerProtectionLawyerToken() public {
        vm.prank(eligibleConsumerLawyer);
        core.setStake(argentinaCourt, 3000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = eligibleConsumerLawyer;
        courtIDs[0] = argentinaCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        uint256 stakedInCourt = sortitionModule.stakeOf(eligibleConsumerLawyer, argentinaCourt);
        assertEq(stakedInCourt, 3000, "Wrong staked amount");
    }

    /// @notice Juror holding both tokens can stake
    function test_stakeSucceedsWithBothTokens() public {
        vm.prank(eligibleBothLawyer);
        core.setStake(argentinaCourt, 3000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = eligibleBothLawyer;
        courtIDs[0] = argentinaCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        uint256 stakedInCourt = sortitionModule.stakeOf(eligibleBothLawyer, argentinaCourt);
        assertEq(stakedInCourt, 3000, "Wrong staked amount");
    }

    /// @notice Juror without any token reverts as non-eligible on stake increase
    function test_stakeRevertsWithoutTokens() public {
        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(ineligibleJuror);
        core.setStake(argentinaCourt, 3000);
    }

    /// @notice Juror who staked while eligible can unstake after losing eligibility
    function test_unstakeSucceedsAfterLosingEligibility() public {
        // Stake while eligible
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = eligibleLawyer;
        courtIDs[0] = argentinaCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Simulate losing eligibility by swapping token addresses to ones the juror doesn't hold
        TestERC721 dummyToken = new TestERC721("Dummy", "D");
        argentinaDK.changeAccreditedProfessionalToken(address(dummyToken));
        argentinaDK.changeAccreditedConsumerProtectionLawyerToken(address(dummyToken));
        assertFalse(argentinaDK.isEligible(eligibleLawyer, argentinaCourt), "Should be ineligible now");

        // Unstake should still succeed (eligibility not checked on decrease)
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 0);

        vm.warp(block.timestamp + stakingDelay);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        uint256 stakedInCourt = sortitionModule.stakeOf(eligibleLawyer, argentinaCourt);
        assertEq(stakedInCourt, 0, "Should be fully unstaked");
    }

    function test_forceUnstakesAfterLosingEligibility() public {
        // Stake while eligible
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = eligibleLawyer;
        courtIDs[0] = argentinaCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Check that can't unstake while still eligible.
        vm.expectRevert(KlerosCore.JurorStillEligible.selector);
        vm.prank(other);
        core.forceUnstake(eligibleLawyer, argentinaCourt);

        // Simulate losing eligibility by swapping token addresses to ones the juror doesn't hold
        TestERC721 dummyToken = new TestERC721("Dummy", "D");
        argentinaDK.changeAccreditedProfessionalToken(address(dummyToken));
        argentinaDK.changeAccreditedConsumerProtectionLawyerToken(address(dummyToken));
        assertFalse(argentinaDK.isEligible(eligibleLawyer, argentinaCourt), "Should be ineligible now");

        // Check permissionless unstaking after eligibility is lost.
        vm.prank(other);
        core.forceUnstake(eligibleLawyer, argentinaCourt);

        uint256 stakedInCourt = sortitionModule.stakeOf(eligibleLawyer, argentinaCourt);
        assertEq(stakedInCourt, 0, "Should be fully unstaked");
    }

    function test_forceUnstake_clearsDelayedStake() public {
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = eligibleLawyer;
        courtIDs[0] = argentinaCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Queue a new voluntary stake.
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 4000);

        (uint256 stake, bool forced, bool pending, uint256 activationTime, uint256 reservedStake) = sortitionModule
            .delayedStakes(eligibleLawyer, argentinaCourt);
        assertEq(stake, 4000, "Wrong delayed stake");
        assertEq(forced, false, "Should not be forced");
        assertEq(pending, true, "Should be pending");
        assertEq(activationTime, block.timestamp + stakingDelay, "Wrong activation time");
        assertEq(reservedStake, 1000, "Wrong reservedStake");

        // Lose eligibility and force unstake during Staking phase.
        TestERC721 dummyToken = new TestERC721("Dummy", "D");
        argentinaDK.changeAccreditedProfessionalToken(address(dummyToken));
        argentinaDK.changeAccreditedConsumerProtectionLawyerToken(address(dummyToken));

        vm.prank(other);
        core.forceUnstake(eligibleLawyer, argentinaCourt);

        assertEq(sortitionModule.stakeOf(eligibleLawyer, argentinaCourt), 0, "Should be fully unstaked");

        (stake, forced, pending, activationTime, reservedStake) = sortitionModule.delayedStakes(
            eligibleLawyer,
            argentinaCourt
        );
        assertEq(stake, 0, "Wrong delayed stake");
        assertEq(forced, false, "Should not be forced");
        assertEq(pending, false, "Should not be pending");
        assertEq(activationTime, 0, "Wrong activation time");
        assertEq(reservedStake, 0, "Wrong reservedStake");
    }

    /// @notice Stake increase reverts after juror loses eligibility
    function test_stakeIncreaseRevertsAfterLosingEligibility() public {
        // Stake while eligible
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 2000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = eligibleLawyer;
        courtIDs[0] = argentinaCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Simulate losing eligibility
        TestERC721 dummyToken = new TestERC721("Dummy", "D");
        argentinaDK.changeAccreditedProfessionalToken(address(dummyToken));
        argentinaDK.changeAccreditedConsumerProtectionLawyerToken(address(dummyToken));

        // Stake increase should revert
        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);
    }

    /// @notice Court with address(0) eligibility allows anyone to stake
    function test_noEligibilityRestrictionWithAddressZero() public {
        // General Court has eligibility = address(0), so anyone can stake
        vm.prank(ineligibleJuror);
        core.setStake(GENERAL_COURT, 1000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = ineligibleJuror;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        uint256 stakedInCourt = sortitionModule.stakeOf(ineligibleJuror, GENERAL_COURT);
        assertEq(stakedInCourt, 1000, "Should be able to stake in court with no eligibility");
    }

    /// @notice Adding eligibility predicate via changeCourtParameters blocks ineligible stakers,
    /// removing it re-allows them
    function test_changeCourtEligibility() public {
        // Create a court with no eligibility restriction
        uint96 openCourt = _createStandardCourt(GENERAL_COURT, 1000, 10000, 0.03 ether, 50);

        // Ineligible juror can stake in the open court
        vm.prank(ineligibleJuror);
        core.setStake(openCourt, 2000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = ineligibleJuror;
        courtIDs[0] = openCourt;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        uint256 stakedInCourt = sortitionModule.stakeOf(ineligibleJuror, openCourt);
        assertEq(stakedInCourt, 2000, "Should stake in open court");

        // Owner adds eligibility predicate
        vm.prank(owner);
        core.changeCourtParameters(
            openCourt,
            false, // hiddenVotes
            1000, // minStake
            10000, // alpha
            0.03 ether, // feeForJuror
            50, // jurorsForJump
            [uint256(10), uint256(20), uint256(30), uint256(40)],
            ICourtEligibility(address(argentinaDK))
        );

        // Ineligible juror can no longer increase stake
        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(ineligibleJuror);
        core.setStake(openCourt, 3000);

        // But can still unstake
        vm.prank(ineligibleJuror);
        core.setStake(openCourt, 0);

        vm.warp(block.timestamp + stakingDelay);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Owner removes eligibility predicate
        vm.prank(owner);
        core.changeCourtParameters(
            openCourt,
            false,
            1000,
            10000,
            0.03 ether,
            50,
            [uint256(10), uint256(20), uint256(30), uint256(40)],
            NULL_ELIGIBILITY_REQUIREMENT
        );

        // Ineligible juror can increase again
        vm.prank(ineligibleJuror);
        core.setStake(openCourt, 3000);

        vm.warp(block.timestamp + stakingDelay);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        stakedInCourt = sortitionModule.stakeOf(ineligibleJuror, openCourt);
        assertEq(stakedInCourt, 3000, "Should stake after eligibility removed");
    }
}
