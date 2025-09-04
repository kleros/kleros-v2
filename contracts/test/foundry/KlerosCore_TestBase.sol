// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol"; // Import the console for logging
import {KlerosCoreMock, KlerosCore, IERC721} from "../../src/test/KlerosCoreMock.sol";
import {IArbitratorV2} from "../../src/arbitration/KlerosCore.sol";
import {IDisputeKit} from "../../src/arbitration/interfaces/IDisputeKit.sol";
import {DisputeKitClassic, DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {DisputeKitSybilResistant} from "../../src/arbitration/dispute-kits/DisputeKitSybilResistant.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import {SortitionModuleMock, SortitionModule} from "../../src/test/SortitionModuleMock.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {BlockHashRNG} from "../../src/rng/BlockHashRNG.sol";
import {RNGWithFallback, IRNG} from "../../src/rng/RNGWithFallback.sol";
import {RNGMock} from "../../src/test/RNGMock.sol";
import {PNK} from "../../src/token/PNK.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {ArbitrableExample, IArbitrableV2} from "../../src/arbitration/arbitrables/ArbitrableExample.sol";
import {DisputeTemplateRegistry} from "../../src/arbitration/DisputeTemplateRegistry.sol";
import "../../src/libraries/Constants.sol";
import {IKlerosCore, KlerosCoreSnapshotProxy} from "../../src/arbitration/view/KlerosCoreSnapshotProxy.sol";

/// @title KlerosCore_TestBase
/// @dev Abstract base contract for KlerosCore tests containing shared setup and utilities
abstract contract KlerosCore_TestBase is Test {
    event Initialized(uint64 version);

    // ************************************* //
    // *          Test Contracts           * //
    // ************************************* //

    KlerosCoreMock core;
    DisputeKitClassic disputeKit;
    SortitionModuleMock sortitionModule;
    BlockHashRNG rng;
    PNK pinakion;
    TestERC20 feeToken;
    TestERC20 wNative;
    ArbitrableExample arbitrable;
    DisputeTemplateRegistry registry;

    // ************************************* //
    // *            Test Accounts          * //
    // ************************************* //

    address owner;
    address guardian;
    address staker1;
    address staker2;
    address disputer;
    address crowdfunder1;
    address crowdfunder2;
    address other;
    address jurorProsecutionModule;

    // ************************************* //
    // *         Test Parameters           * //
    // ************************************* //

    uint256 minStake;
    uint256 alpha;
    uint256 feeForJuror;
    uint256 jurorsForCourtJump;
    bytes sortitionExtraData;
    bytes arbitratorExtraData;
    uint256[4] timesPerPeriod;
    bool hiddenVotes;
    uint256 totalSupply = 1000000 ether;
    uint256 minStakingTime;
    uint256 maxDrawingTime;
    uint256 rngLookahead; // Time in seconds
    string templateData;
    string templateDataMappings;

    function setUp() public virtual {
        KlerosCoreMock coreLogic = new KlerosCoreMock();
        SortitionModuleMock smLogic = new SortitionModuleMock();
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        DisputeTemplateRegistry registryLogic = new DisputeTemplateRegistry();
        pinakion = new PNK();
        feeToken = new TestERC20("Test", "TST");
        wNative = new TestERC20("wrapped ETH", "wETH");

        owner = msg.sender;
        guardian = vm.addr(1);
        staker1 = vm.addr(2);
        staker2 = vm.addr(3);
        disputer = vm.addr(4);
        crowdfunder1 = vm.addr(5);
        crowdfunder2 = vm.addr(6);
        vm.deal(disputer, 10 ether);
        vm.deal(crowdfunder1, 10 ether);
        vm.deal(crowdfunder2, 10 ether);
        jurorProsecutionModule = vm.addr(8);
        other = vm.addr(9);
        minStake = 1000;
        alpha = 10000;
        feeForJuror = 0.03 ether;
        jurorsForCourtJump = 511;
        timesPerPeriod = [60, 120, 180, 240];

        pinakion.transfer(msg.sender, totalSupply - 2 ether);
        pinakion.transfer(staker1, 1 ether);
        pinakion.transfer(staker2, 1 ether);

        sortitionExtraData = abi.encode(uint256(5));
        minStakingTime = 18;
        maxDrawingTime = 24;
        hiddenVotes = false;

        rngLookahead = 30;
        rng = new BlockHashRNG(msg.sender, address(sortitionModule), rngLookahead);

        UUPSProxy proxyCore = new UUPSProxy(address(coreLogic), "");

        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address,uint256)",
            owner,
            address(proxyCore),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        disputeKit = DisputeKitClassic(address(proxyDk));

        bytes memory initDataSm = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,address,uint256,uint256)",
            owner,
            address(proxyCore),
            minStakingTime,
            maxDrawingTime,
            rng,
            type(uint256).max,
            type(uint256).max
        );

        UUPSProxy proxySm = new UUPSProxy(address(smLogic), initDataSm);
        sortitionModule = SortitionModuleMock(address(proxySm));
        vm.prank(owner);
        rng.changeConsumer(address(sortitionModule));

        core = KlerosCoreMock(address(proxyCore));
        core.initialize(
            owner,
            guardian,
            pinakion,
            jurorProsecutionModule,
            disputeKit,
            hiddenVotes,
            [minStake, alpha, feeForJuror, jurorsForCourtJump],
            timesPerPeriod,
            sortitionExtraData,
            sortitionModule,
            address(wNative),
            IERC721(address(0))
        );
        vm.prank(staker1);
        pinakion.approve(address(core), 1 ether);
        vm.prank(staker2);
        pinakion.approve(address(core), 1 ether);

        templateData = "AAA";
        templateDataMappings = "BBB";
        arbitratorExtraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);

        bytes memory initDataRegistry = abi.encodeWithSignature("initialize(address)", owner);
        UUPSProxy proxyRegistry = new UUPSProxy(address(registryLogic), initDataRegistry);
        registry = DisputeTemplateRegistry(address(proxyRegistry));

        arbitrable = new ArbitrableExample(
            core,
            templateData,
            templateDataMappings,
            arbitratorExtraData,
            registry,
            feeToken
        );
    }

    // ************************************* //
    // *         Helper Functions          * //
    // ************************************* //

    /// @dev Helper function to create a new dispute kit
    function _createNewDisputeKit() internal returns (DisputeKitSybilResistant) {
        return new DisputeKitSybilResistant();
    }

    /// @dev Helper function to create a new court with standard parameters
    function _createStandardCourt(
        uint96 parent,
        uint256 minStakeValue,
        uint256 alphaValue,
        uint256 feeForJurorValue,
        uint256 jurorsForJumpValue
    ) internal returns (uint96) {
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;

        vm.prank(owner);
        core.createCourt(
            parent,
            hiddenVotes,
            minStakeValue,
            alphaValue,
            feeForJurorValue,
            jurorsForJumpValue,
            timesPerPeriod,
            sortitionExtraData,
            supportedDK
        );

        return uint96(core.getCourtChildren(parent)[core.getCourtChildren(parent).length - 1]);
    }

    /// @dev Helper function to check court parameters
    function _assertCourtParameters(
        uint96 courtId,
        uint96 expectedParent,
        bool expectedHiddenVotes,
        uint256 expectedMinStake,
        uint256 expectedAlpha,
        uint256 expectedFeeForJuror,
        uint256 expectedJurorsForJump,
        bool expectedDisabled
    ) internal {
        (
            uint96 courtParent,
            bool courtHiddenVotes,
            uint256 courtMinStake,
            uint256 courtAlpha,
            uint256 courtFeeForJuror,
            uint256 courtJurorsForCourtJump,
            bool courtDisabled
        ) = core.courts(courtId);

        assertEq(courtParent, expectedParent, "Wrong court parent");
        assertEq(courtHiddenVotes, expectedHiddenVotes, "Wrong hiddenVotes value");
        assertEq(courtMinStake, expectedMinStake, "Wrong minStake value");
        assertEq(courtAlpha, expectedAlpha, "Wrong alpha value");
        assertEq(courtFeeForJuror, expectedFeeForJuror, "Wrong feeForJuror value");
        assertEq(courtJurorsForCourtJump, expectedJurorsForJump, "Wrong jurorsForCourtJump value");
        assertEq(courtDisabled, expectedDisabled, "Wrong disabled state");
    }

    /// @dev Helper function to check times per period
    function _assertTimesPerPeriod(uint96 courtId, uint256[4] memory expectedTimes) internal {
        uint256[4] memory courtTimesPerPeriod = core.getTimesPerPeriod(courtId);
        for (uint256 i = 0; i < 4; i++) {
            assertEq(courtTimesPerPeriod[i], expectedTimes[i], "Wrong times per period");
        }
    }
}
