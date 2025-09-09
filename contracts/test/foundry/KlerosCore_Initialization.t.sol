// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore, IERC721} from "../../src/arbitration/KlerosCore.sol";
import {KlerosCoreMock} from "../../src/test/KlerosCoreMock.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {SortitionModuleMock} from "../../src/test/SortitionModuleMock.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {BlockHashRNG} from "../../src/rng/BlockHashRNG.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import {PNK} from "../../src/token/PNK.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_InitializationTest
/// @dev Tests for KlerosCore initialization and basic configuration
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract KlerosCore_InitializationTest is KlerosCore_TestBase {
    function test_initialize() public view {
        assertEq(core.owner(), msg.sender, "Wrong owner");
        assertEq(core.guardian(), guardian, "Wrong guardian");
        assertEq(address(core.pinakion()), address(pinakion), "Wrong pinakion address");
        assertEq(core.jurorProsecutionModule(), jurorProsecutionModule, "Wrong jurorProsecutionModule address");
        assertEq(address(core.sortitionModule()), address(sortitionModule), "Wrong sortitionModule address");
        assertEq(core.getDisputeKitsLength(), 2, "Wrong DK array length");

        _assertCourtParameters(FORKING_COURT, FORKING_COURT, false, 0, 0, 0, 0);
        _assertCourtParameters(GENERAL_COURT, FORKING_COURT, false, 1000, 10000, 0.03 ether, 511);

        uint256[] memory children = core.getCourtChildren(GENERAL_COURT);
        assertEq(children.length, 0, "No children");
        _assertTimesPerPeriod(GENERAL_COURT, timesPerPeriod);

        assertEq(address(core.disputeKits(NULL_DISPUTE_KIT)), address(0), "Wrong address NULL_DISPUTE_KIT");
        assertEq(
            address(core.disputeKits(DISPUTE_KIT_CLASSIC)),
            address(disputeKit),
            "Wrong address DISPUTE_KIT_CLASSIC"
        );
        assertEq(core.isSupported(FORKING_COURT, NULL_DISPUTE_KIT), false, "Forking court null dk should be false");
        assertEq(
            core.isSupported(FORKING_COURT, DISPUTE_KIT_CLASSIC),
            false,
            "Forking court classic dk should be false"
        );
        assertEq(core.isSupported(GENERAL_COURT, NULL_DISPUTE_KIT), false, "General court null dk should be false");
        assertEq(core.isSupported(GENERAL_COURT, DISPUTE_KIT_CLASSIC), true, "General court classic dk should be true");
        assertEq(core.paused(), false, "Wrong paused value");
        assertEq(core.wNative(), address(wNative), "Wrong wNative");
        assertEq(address(core.jurorNft()), address(0), "Wrong jurorNft");
        assertEq(core.arbitrableWhitelistEnabled(), false, "Wrong arbitrableWhitelistEnabled");

        assertEq(pinakion.name(), "Pinakion", "Wrong token name");
        assertEq(pinakion.symbol(), "PNK", "Wrong token symbol");
        assertEq(pinakion.totalSupply(), 1000000 ether, "Wrong total supply");
        assertEq(pinakion.balanceOf(msg.sender), 999998 ether, "Wrong token balance of owner");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");
        assertEq(pinakion.allowance(staker1, address(core)), 1 ether, "Wrong allowance for staker1");
        assertEq(pinakion.balanceOf(staker2), 1 ether, "Wrong token balance of staker2");
        assertEq(pinakion.allowance(staker2, address(core)), 1 ether, "Wrong allowance for staker2");

        assertEq(disputeKit.owner(), msg.sender, "Wrong DK owner");
        assertEq(disputeKit.getJumpDisputeKitID(), DISPUTE_KIT_CLASSIC, "Wrong jump DK");
        assertEq(disputeKit.jumpDisputeKitID(), DISPUTE_KIT_CLASSIC, "Wrong jump DK storage var");
        assertEq(address(disputeKit.core()), address(core), "Wrong core in DK");

        assertEq(sortitionModule.owner(), msg.sender, "Wrong SM owner");
        assertEq(address(sortitionModule.core()), address(core), "Wrong core in SM");
        assertEq(uint256(sortitionModule.phase()), uint256(ISortitionModule.Phase.staking), "Phase should be 0");
        assertEq(sortitionModule.minStakingTime(), 18, "Wrong minStakingTime");
        assertEq(sortitionModule.maxDrawingTime(), 24, "Wrong maxDrawingTime");
        assertEq(sortitionModule.lastPhaseChange(), block.timestamp, "Wrong lastPhaseChange");
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "disputesWithoutJurors should be 0");
        assertEq(address(sortitionModule.rng()), address(rng), "Wrong RNG address");
        assertEq(sortitionModule.randomNumber(), 0, "randomNumber should be 0");
        assertEq(sortitionModule.delayedStakeWriteIndex(), 0, "delayedStakeWriteIndex should be 0");
        assertEq(sortitionModule.delayedStakeReadIndex(), 1, "Wrong delayedStakeReadIndex");
        assertEq(sortitionModule.maxStakePerJuror(), type(uint256).max, "Wrong maxStakePerJuror");
        assertEq(sortitionModule.maxTotalStaked(), type(uint256).max, "Wrong maxTotalStaked");
        assertEq(sortitionModule.totalStaked(), 0, "Wrong totalStaked");

        (uint256 K, uint256 nodeLength) = sortitionModule.getSortitionProperties(bytes32(uint256(FORKING_COURT)));
        assertEq(K, 5, "Wrong tree K FORKING_COURT");
        assertEq(nodeLength, 1, "Wrong node length for created tree FORKING_COURT");

        (K, nodeLength) = sortitionModule.getSortitionProperties(bytes32(uint256(GENERAL_COURT)));
        assertEq(K, 5, "Wrong tree K GENERAL_COURT");
        assertEq(nodeLength, 1, "Wrong node length for created tree GENERAL_COURT");
    }

    function test_initialize_events() public {
        KlerosCoreMock coreLogic = new KlerosCoreMock();
        SortitionModuleMock smLogic = new SortitionModuleMock();
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        PNK newPinakion = new PNK();

        address newOwner = msg.sender;
        address newGuardian = vm.addr(1);
        address newStaker1 = vm.addr(2);
        address newJurorProsecutionModule = vm.addr(8);
        uint256 newMinStake = 1000;
        uint256 newAlpha = 10000;
        uint256 newFeeForJuror = 0.03 ether;
        uint256 newJurorsForCourtJump = 511;
        uint256[4] memory newTimesPerPeriod = [uint256(60), uint256(120), uint256(180), uint256(240)];

        newPinakion.transfer(msg.sender, totalSupply - 1 ether);
        newPinakion.transfer(newStaker1, 1 ether);

        bytes memory newSortitionExtraData = abi.encode(uint256(5));
        uint256 newMinStakingTime = 18;
        uint256 newMaxDrawingTime = 24;
        bool newHiddenVotes = false;

        uint256 newRngLookahead = 20;
        BlockHashRNG newRng = new BlockHashRNG(msg.sender, address(sortitionModule), newRngLookahead);

        UUPSProxy proxyCore = new UUPSProxy(address(coreLogic), "");

        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address,uint256)",
            newOwner,
            address(proxyCore),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        DisputeKitClassic newDisputeKit = DisputeKitClassic(address(proxyDk));

        bytes memory initDataSm = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,address,uint256,uint256)",
            newOwner,
            address(proxyCore),
            newMinStakingTime,
            newMaxDrawingTime,
            newRng,
            type(uint256).max,
            type(uint256).max
        );

        UUPSProxy proxySm = new UUPSProxy(address(smLogic), initDataSm);
        SortitionModuleMock newSortitionModule = SortitionModuleMock(address(proxySm));
        vm.prank(newOwner);
        newRng.changeConsumer(address(newSortitionModule));

        KlerosCoreMock newCore = KlerosCoreMock(address(proxyCore));
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitCreated(DISPUTE_KIT_CLASSIC, newDisputeKit);
        vm.expectEmit(true, true, true, true);

        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        emit KlerosCore.CourtCreated(
            GENERAL_COURT,
            FORKING_COURT,
            false,
            1000,
            10000,
            0.03 ether,
            511,
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Explicitly convert otherwise it throws
            supportedDK
        );
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(GENERAL_COURT, DISPUTE_KIT_CLASSIC, true);
        newCore.initialize(
            newOwner,
            newGuardian,
            newPinakion,
            newJurorProsecutionModule,
            newDisputeKit,
            newHiddenVotes,
            [newMinStake, newAlpha, newFeeForJuror, newJurorsForCourtJump],
            newTimesPerPeriod,
            newSortitionExtraData,
            newSortitionModule,
            address(wNative),
            IERC721(address(0))
        );
    }
}
