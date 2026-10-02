// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {KlerosCoreMock} from "../../src/test/KlerosCoreMock.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {SortitionModuleMock} from "../../src/test/SortitionModuleMock.sol";
import {BlockHashRNG} from "../../src/rng/BlockhashRNG.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import {PNK} from "../../src/token/PNK.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_InitializationTest
/// @dev Tests for KlerosCore initialization and basic configuration
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract KlerosCore_InitializationTest is KlerosCore_TestBase {
    function test_initialize() public view {
        assertEq(core.owner(), msg.sender, "Wrong owner");
        assertEq(address(core.pnkToken()), address(pinakion), "Wrong pinakion address");
        assertEq(address(core.sortitionModule()), address(sortitionModule), "Wrong sortitionModule address");
        assertEq(core.getDisputeKitsLength(), 2, "Wrong DK array length");

        _assertCourtParameters(FINAL_COURT, FINAL_COURT, false, type(uint256).max, 0, 0, 0, 0);
        _assertCourtParameters(GENERAL_COURT, FINAL_COURT, false, 1000, 10000, 0.03 ether, 511, 1);

        _assertTimesPerPeriod(GENERAL_COURT, timesPerPeriod);
        _assertTimesPerPeriod(FINAL_COURT, finalCourtTimesPerPeriod);

        assertEq(
            address(core.disputeKits(FINAL_DISPUTE_KIT)),
            address(centralizedKit),
            "Wrong address FINAL_DISPUTE_KIT"
        );
        assertEq(
            address(core.disputeKits(DISPUTE_KIT_CLASSIC)),
            address(disputeKit),
            "Wrong address DISPUTE_KIT_CLASSIC"
        );
        assertEq(
            core.isSupported(FINAL_COURT, FINAL_DISPUTE_KIT),
            true,
            "Final court FINAL_DISPUTE_KIT should be true"
        );
        assertEq(core.isSupported(FINAL_COURT, DISPUTE_KIT_CLASSIC), false, "Final court classic dk should be false");
        assertEq(
            core.isSupported(GENERAL_COURT, FINAL_DISPUTE_KIT),
            false,
            "General court FINAL_DISPUTE_KIT should be false"
        );
        assertEq(core.isSupported(GENERAL_COURT, DISPUTE_KIT_CLASSIC), true, "General court classic dk should be true");
        assertEq(core.wNative(), address(wNative), "Wrong wNative");

        assertEq(pinakion.name(), "Pinakion", "Wrong token name");
        assertEq(pinakion.symbol(), "PNK", "Wrong token symbol");
        assertEq(pinakion.totalSupply(), 1000000 ether, "Wrong total supply");
        assertEq(pinakion.balanceOf(msg.sender), 999998 ether, "Wrong token balance of owner");
        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(pinakion.allowance(staker1, address(core)), 0, "Wrong allowance for staker1");
        assertEq(pinakion.balanceOf(staker2), 0, "Wrong token balance of staker2");
        assertEq(pinakion.allowance(staker2, address(core)), 0, "Wrong allowance for staker2");

        assertEq(pinakion.balanceOf(address(core)), 2 ether, "Wrong token balance of the core");
        assertEq(core.balances(staker1), 1 ether, "Wrong stPnk balance of staker1");
        assertEq(core.balances(staker2), 1 ether, "Wrong stPnk balance of staker2");

        assertEq(address(centralizedKit.core()), address(core), "Wrong core in centralDK");
        assertEq(centralizedKit.ruler(), ruler, "Wrong ruler in centralDK");

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

        (uint256 K, uint256 nodeLength) = sortitionModule.getSortitionProperties(bytes32(uint256(FINAL_COURT)));
        assertEq(nodeLength, 0, "FINAL_COURT tree should be empty");

        (K, nodeLength) = sortitionModule.getSortitionProperties(bytes32(uint256(GENERAL_COURT)));
        assertEq(K, 6, "Wrong tree K GENERAL_COURT");
        assertEq(nodeLength, 1, "Wrong node length for created tree GENERAL_COURT");
    }

    function test_initialize_events() public {
        KlerosCoreMock coreLogic = new KlerosCoreMock();
        SortitionModuleMock smLogic = new SortitionModuleMock();
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        PNK newPinakion = new PNK();

        address newOwner = msg.sender;
        address newStaker1 = vm.addr(2);
        uint256 newMinStake = 1000;
        uint256 newAlpha = 10000;
        uint256 newFeeForJuror = 0.03 ether;
        uint256 newJurorsForCourtJump = 511;
        uint256[4] memory newTimesPerPeriod = [uint256(60), uint256(120), uint256(180), uint256(240)];

        newPinakion.transfer(msg.sender, totalSupply - 1 ether);
        newPinakion.transfer(newStaker1, 1 ether);

        uint256 newMinStakingTime = 18;
        uint256 newMaxDrawingTime = 24;
        bool newHiddenVotes = false;
        uint256 newStakingDelay = 40;

        uint256 newRngLookahead = 20;
        BlockHashRNG newRng = new BlockHashRNG(msg.sender, address(sortitionModule), newRngLookahead);

        TransparentUpgradeableProxy proxyCore = new TransparentUpgradeableProxy(address(coreLogic), owner, "");

        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(proxyCore),
            address(wNative),
            FINAL_DISPUTE_KIT
        );

        TransparentUpgradeableProxy proxyDk = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk);
        DisputeKitClassic newDisputeKit = DisputeKitClassic(address(proxyDk));

        bytes memory initDataSm = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,address,uint256)",
            newOwner,
            address(proxyCore),
            newMinStakingTime,
            newMaxDrawingTime,
            newRng,
            newStakingDelay
        );

        TransparentUpgradeableProxy proxySm = new TransparentUpgradeableProxy(address(smLogic), owner, initDataSm);
        SortitionModuleMock newSortitionModule = SortitionModuleMock(address(proxySm));
        vm.prank(newOwner);
        newRng.changeConsumer(address(newSortitionModule));
        vm.prank(newOwner); // Use the owner to deploy converter, to avoid modifying permission tests.

        KlerosCoreMock newCore = KlerosCoreMock(address(proxyCore));
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitCreated(FINAL_DISPUTE_KIT, centralizedKit);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitCreated(DISPUTE_KIT_CLASSIC, newDisputeKit);
        vm.expectEmit(true, true, true, true);

        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = FINAL_DISPUTE_KIT;
        emit KlerosCore.CourtCreated(
            FINAL_COURT,
            FINAL_COURT,
            false,
            type(uint256).max,
            0,
            0,
            0,
            [uint256(0), uint256(0), uint256(0), uint256(0)], // Explicitly convert otherwise it throws
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(FINAL_COURT, FINAL_DISPUTE_KIT, true);

        vm.expectEmit(true, true, true, true);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        emit KlerosCore.CourtCreated(
            GENERAL_COURT,
            FINAL_COURT,
            false,
            1000,
            10000,
            0.03 ether,
            511,
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Explicitly convert otherwise it throws
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(GENERAL_COURT, DISPUTE_KIT_CLASSIC, true);
        newCore.initialize(
            payable(newOwner),
            newPinakion,
            newDisputeKit,
            centralizedKit,
            newHiddenVotes,
            [newMinStake, newAlpha, newFeeForJuror, newJurorsForCourtJump],
            newTimesPerPeriod,
            finalCourtTimesPerPeriod,
            newSortitionModule,
            address(wNative)
        );
    }
}
