// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitGatedArgentinaConsumerProtection} from "../../src/arbitration/dispute-kits/DisputeKitGatedArgentinaConsumerProtection.sol";
import {ICourtEligibility} from "../../src/arbitration/interfaces/ICourtEligibility.sol";
import {TestERC721} from "../../src/token/TestERC721.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import "../../src/libraries/Constants.sol";

/// @title DisputeKitGatedArgentinaConsumerProtection_StakingTest
/// @dev Tests for ICourtEligibility enforcement during staking via DisputeKitGatedArgentinaConsumerProtection
contract DisputeKitGatedArgentinaConsumerProtection_StakingTest is KlerosCore_TestBase {
    // ************************************* //
    // *          Test Contracts           * //
    // ************************************* //

    DisputeKitGatedArgentinaConsumerProtection argentinaDK;
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
        DisputeKitGatedArgentinaConsumerProtection dkLogic = new DisputeKitGatedArgentinaConsumerProtection();
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,address,address,address,address)",
            owner,
            address(core),
            address(wNative),
            address(accreditedProfessionalToken),
            address(accreditedConsumerProtectionLawyerToken)
        );
        UUPSProxy proxyDK = new UUPSProxy(address(dkLogic), initData);
        argentinaDK = DisputeKitGatedArgentinaConsumerProtection(address(proxyDK));

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
            sortitionExtraData,
            supportedDK,
            ICourtEligibility(address(argentinaDK)) // eligibility predicate
        );

        uint256[] memory children = core.getCourtChildren(GENERAL_COURT);
        argentinaCourt = uint96(children[children.length - 1]);

        // Give PNK to all test jurors and approve core
        address[4] memory jurors = [eligibleLawyer, eligibleConsumerLawyer, eligibleBothLawyer, ineligibleJuror];
        for (uint256 i = 0; i < jurors.length; i++) {
            vm.prank(owner);
            pinakion.transfer(jurors[i], 5000);
            vm.prank(jurors[i]);
            pinakion.approve(address(core), 5000);
        }
    }

    // ************************************* //
    // *              Tests                * //
    // ************************************* //

    /// @notice Juror holding only the accredited professional token can stake
    function test_stakeSucceedsWithAccreditedProfessionalToken() public {
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);

        (uint256 totalStaked, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(
            eligibleLawyer,
            argentinaCourt
        );
        assertEq(stakedInCourt, 3000, "Wrong staked amount");
        assertEq(totalStaked, 3000, "Wrong total staked");
    }

    /// @notice Juror holding only the consumer protection lawyer token can stake
    function test_stakeSucceedsWithConsumerProtectionLawyerToken() public {
        vm.prank(eligibleConsumerLawyer);
        core.setStake(argentinaCourt, 3000);

        (, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(eligibleConsumerLawyer, argentinaCourt);
        assertEq(stakedInCourt, 3000, "Wrong staked amount");
    }

    /// @notice Juror holding both tokens can stake
    function test_stakeSucceedsWithBothTokens() public {
        vm.prank(eligibleBothLawyer);
        core.setStake(argentinaCourt, 3000);

        (, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(eligibleBothLawyer, argentinaCourt);
        assertEq(stakedInCourt, 3000, "Wrong staked amount");
    }

    /// @notice Juror without any token reverts NotEligibleForStaking on stake increase
    function test_stakeRevertsWithoutTokens() public {
        vm.expectRevert(KlerosCore.NotEligibleForStaking.selector);
        vm.prank(ineligibleJuror);
        core.setStake(argentinaCourt, 3000);
    }

    /// @notice Juror who staked while eligible can unstake after losing eligibility
    function test_unstakeSucceedsAfterLosingEligibility() public {
        // Stake while eligible
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);

        // Simulate losing eligibility by swapping token addresses to ones the juror doesn't hold
        TestERC721 dummyToken = new TestERC721("Dummy", "D");
        vm.startPrank(owner);
        argentinaDK.changeAccreditedProfessionalToken(address(dummyToken));
        argentinaDK.changeAccreditedConsumerProtectionLawyerToken(address(dummyToken));
        vm.stopPrank();
        assertFalse(argentinaDK.isEligible(eligibleLawyer, argentinaCourt), "Should be ineligible now");

        // Unstake should still succeed (eligibility not checked on decrease)
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 0);

        (, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(eligibleLawyer, argentinaCourt);
        assertEq(stakedInCourt, 0, "Should be fully unstaked");
    }

    /// @notice Stake increase reverts after juror loses eligibility
    function test_stakeIncreaseRevertsAfterLosingEligibility() public {
        // Stake while eligible
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 2000);

        // Simulate losing eligibility
        TestERC721 dummyToken = new TestERC721("Dummy", "D");
        vm.startPrank(owner);
        argentinaDK.changeAccreditedProfessionalToken(address(dummyToken));
        argentinaDK.changeAccreditedConsumerProtectionLawyerToken(address(dummyToken));
        vm.stopPrank();

        // Stake increase should revert
        vm.expectRevert(KlerosCore.NotEligibleForStaking.selector);
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);
    }

    /// @notice Stake decrease succeeds after juror loses eligibility
    function test_stakeDecreaseSucceedsAfterLosingEligibility() public {
        // Stake while eligible
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 3000);

        // Simulate losing eligibility
        TestERC721 dummyToken = new TestERC721("Dummy", "D");
        vm.startPrank(owner);
        argentinaDK.changeAccreditedProfessionalToken(address(dummyToken));
        argentinaDK.changeAccreditedConsumerProtectionLawyerToken(address(dummyToken));
        vm.stopPrank();

        // Stake decrease should succeed
        vm.prank(eligibleLawyer);
        core.setStake(argentinaCourt, 1000);

        (, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(eligibleLawyer, argentinaCourt);
        assertEq(stakedInCourt, 1000, "Wrong staked amount after decrease");
    }

    /// @notice Court with address(0) eligibility allows anyone to stake
    function test_noEligibilityRestrictionWithAddressZero() public {
        // General Court has eligibility = address(0), so anyone can stake
        vm.prank(ineligibleJuror);
        core.setStake(GENERAL_COURT, 1000);

        (, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(ineligibleJuror, GENERAL_COURT);
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

        (, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(ineligibleJuror, openCourt);
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
        vm.expectRevert(KlerosCore.NotEligibleForStaking.selector);
        vm.prank(ineligibleJuror);
        core.setStake(openCourt, 3000);

        // But can still decrease
        vm.prank(ineligibleJuror);
        core.setStake(openCourt, 1000);

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

        (, , stakedInCourt, ) = sortitionModule.getJurorBalance(ineligibleJuror, openCourt);
        assertEq(stakedInCourt, 3000, "Should stake after eligibility removed");
    }
}
