// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol"; // Import the console for logging
import {KlerosCoreMock, KlerosCoreBase} from "../../src/test/KlerosCoreMock.sol";
import {IArbitratorV2} from "../../src/arbitration/KlerosCoreBase.sol";
import {IDisputeKit} from "../../src/arbitration/interfaces/IDisputeKit.sol";
import {DisputeKitClassic, DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {DisputeKitSybilResistant} from "../../src/arbitration/dispute-kits/DisputeKitSybilResistant.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import {SortitionModuleMock, SortitionModuleBase} from "../../src/test/SortitionModuleMock.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {BlockHashRNG} from "../../src/rng/BlockHashRNG.sol";
import {PNK} from "../../src/token/PNK.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {ArbitrableExample, IArbitrableV2} from "../../src/arbitration/arbitrables/ArbitrableExample.sol";
import {DisputeTemplateRegistry} from "../../src/arbitration/DisputeTemplateRegistry.sol";
import "../../src/libraries/Constants.sol";
import {IKlerosCore, KlerosCoreSnapshotProxy} from "../../src/arbitration/view/KlerosCoreSnapshotProxy.sol";

contract KlerosCoreTest is Test {
    event Initialized(uint64 version);

    KlerosCoreMock core;
    DisputeKitClassic disputeKit;
    SortitionModuleMock sortitionModule;
    BlockHashRNG rng;
    PNK pinakion;
    TestERC20 feeToken;
    TestERC20 wNative;
    ArbitrableExample arbitrable;
    DisputeTemplateRegistry registry;
    address governor;
    address guardian;
    address staker1;
    address staker2;
    address disputer;
    address crowdfunder1;
    address crowdfunder2;
    address other;
    address jurorProsecutionModule;
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

    function setUp() public {
        KlerosCoreMock coreLogic = new KlerosCoreMock();
        SortitionModuleMock smLogic = new SortitionModuleMock();
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        DisputeTemplateRegistry registryLogic = new DisputeTemplateRegistry();
        pinakion = new PNK();
        feeToken = new TestERC20("Test", "TST");
        wNative = new TestERC20("wrapped ETH", "wETH");

        governor = msg.sender;
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
            "initialize(address,address,address)",
            governor,
            address(proxyCore),
            address(wNative)
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        disputeKit = DisputeKitClassic(address(proxyDk));

        bytes memory initDataSm = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,address)",
            governor,
            address(proxyCore),
            minStakingTime,
            maxDrawingTime,
            rng
        );

        UUPSProxy proxySm = new UUPSProxy(address(smLogic), initDataSm);
        sortitionModule = SortitionModuleMock(address(proxySm));
        vm.prank(governor);
        rng.changeConsumer(address(sortitionModule));

        core = KlerosCoreMock(address(proxyCore));
        core.initialize(
            governor,
            guardian,
            pinakion,
            jurorProsecutionModule,
            disputeKit,
            hiddenVotes,
            [minStake, alpha, feeForJuror, jurorsForCourtJump],
            timesPerPeriod,
            sortitionExtraData,
            sortitionModule,
            address(wNative)
        );
        vm.prank(staker1);
        pinakion.approve(address(core), 1 ether);
        vm.prank(staker2);
        pinakion.approve(address(core), 1 ether);

        templateData = "AAA";
        templateDataMappings = "BBB";
        arbitratorExtraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);

        bytes memory initDataRegistry = abi.encodeWithSignature("initialize(address)", governor);
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

    function test_initialize() public {
        assertEq(core.governor(), msg.sender, "Wrong governor");
        assertEq(core.guardian(), guardian, "Wrong guardian");
        assertEq(address(core.pinakion()), address(pinakion), "Wrong pinakion address");
        assertEq(core.jurorProsecutionModule(), jurorProsecutionModule, "Wrong jurorProsecutionModule address");
        assertEq(address(core.sortitionModule()), address(sortitionModule), "Wrong sortitionModule address");
        assertEq(core.getDisputeKitsLength(), 2, "Wrong DK array length");
        (
            uint96 courtParent,
            bool courtHiddenVotes,
            uint256 courtMinStake,
            uint256 courtAlpha,
            uint256 courtFeeForJuror,
            uint256 courtJurorsForCourtJump,
            bool courtDisabled
        ) = core.courts(FORKING_COURT);
        assertEq(courtParent, FORKING_COURT, "Wrong court parent");
        assertEq(courtHiddenVotes, false, "Wrong hiddenVotes value");
        assertEq(courtMinStake, 0, "Wrong minStake value");
        assertEq(courtAlpha, 0, "Wrong alpha value");
        assertEq(courtFeeForJuror, 0, "Wrong feeForJuror value");
        assertEq(courtJurorsForCourtJump, 0, "Wrong jurorsForCourtJump value");
        assertEq(courtDisabled, false, "Court should not be disabled");
        (
            courtParent,
            courtHiddenVotes,
            courtMinStake,
            courtAlpha,
            courtFeeForJuror,
            courtJurorsForCourtJump,
            courtDisabled
        ) = core.courts(GENERAL_COURT);
        assertEq(courtParent, FORKING_COURT, "Wrong court parent");
        assertEq(courtHiddenVotes, false, "Wrong hiddenVotes value");
        assertEq(courtMinStake, 1000, "Wrong minStake value");
        assertEq(courtAlpha, 10000, "Wrong alpha value");
        assertEq(courtFeeForJuror, 0.03 ether, "Wrong feeForJuror value");
        assertEq(courtJurorsForCourtJump, 511, "Wrong jurorsForCourtJump value");
        assertEq(courtDisabled, false, "Court should not be disabled");

        uint256[] memory children = core.getCourtChildren(GENERAL_COURT);
        assertEq(children.length, 0, "No children");
        uint256[4] memory courtTimesPerPeriod = core.getTimesPerPeriod(GENERAL_COURT);
        for (uint256 i = 0; i < 4; i++) {
            assertEq(courtTimesPerPeriod[i], timesPerPeriod[i], "Wrong times per period");
        }

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

        assertEq(pinakion.name(), "Pinakion", "Wrong token name");
        assertEq(pinakion.symbol(), "PNK", "Wrong token symbol");
        assertEq(pinakion.totalSupply(), 1000000 ether, "Wrong total supply");
        assertEq(pinakion.balanceOf(msg.sender), 999998 ether, "Wrong token balance of governor");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");
        assertEq(pinakion.allowance(staker1, address(core)), 1 ether, "Wrong allowance for staker1");
        assertEq(pinakion.balanceOf(staker2), 1 ether, "Wrong token balance of staker2");
        assertEq(pinakion.allowance(staker2, address(core)), 1 ether, "Wrong allowance for staker2");

        assertEq(disputeKit.governor(), msg.sender, "Wrong DK governor");
        assertEq(address(disputeKit.core()), address(core), "Wrong core in DK");

        assertEq(sortitionModule.governor(), msg.sender, "Wrong SM governor");
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
        pinakion = new PNK();

        governor = msg.sender;
        guardian = vm.addr(1);
        staker1 = vm.addr(2);
        other = vm.addr(9);
        jurorProsecutionModule = vm.addr(8);
        minStake = 1000;
        alpha = 10000;
        feeForJuror = 0.03 ether;
        jurorsForCourtJump = 511;
        timesPerPeriod = [60, 120, 180, 240];

        pinakion.transfer(msg.sender, totalSupply - 1 ether);
        pinakion.transfer(staker1, 1 ether);

        sortitionExtraData = abi.encode(uint256(5));
        minStakingTime = 18;
        maxDrawingTime = 24;
        hiddenVotes = false;

        rngLookahead = 20;
        rng = new BlockHashRNG(msg.sender, address(sortitionModule), rngLookahead);

        UUPSProxy proxyCore = new UUPSProxy(address(coreLogic), "");

        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address)",
            governor,
            address(proxyCore),
            address(wNative)
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        disputeKit = DisputeKitClassic(address(proxyDk));

        bytes memory initDataSm = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,address)",
            governor,
            address(proxyCore),
            minStakingTime,
            maxDrawingTime,
            rng
        );

        UUPSProxy proxySm = new UUPSProxy(address(smLogic), initDataSm);
        sortitionModule = SortitionModuleMock(address(proxySm));
        vm.prank(governor);
        rng.changeConsumer(address(sortitionModule));

        core = KlerosCoreMock(address(proxyCore));
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitCreated(DISPUTE_KIT_CLASSIC, disputeKit);
        vm.expectEmit(true, true, true, true);

        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        emit KlerosCoreBase.CourtCreated(
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
        emit KlerosCoreBase.DisputeKitEnabled(GENERAL_COURT, DISPUTE_KIT_CLASSIC, true);
        core.initialize(
            governor,
            guardian,
            pinakion,
            jurorProsecutionModule,
            disputeKit,
            hiddenVotes,
            [minStake, alpha, feeForJuror, jurorsForCourtJump],
            timesPerPeriod,
            sortitionExtraData,
            sortitionModule,
            address(wNative)
        );
    }

    // ****************************************** //
    // *             Governance  test           * //
    // ****************************************** //

    function test_pause() public {
        vm.expectRevert(KlerosCoreBase.GuardianOrGovernorOnly.selector);
        vm.prank(other);
        core.pause();
        // Note that we must explicitly switch to the governor/guardian address to make the call, otherwise Foundry treats UUPS proxy as msg.sender.
        vm.prank(guardian);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Paused();
        core.pause();
        assertEq(core.paused(), true, "Wrong paused value");
        // Switch between governor and guardian to test both. WhenNotPausedOnly modifier is triggered after governor's check.
        vm.prank(governor);
        vm.expectRevert(KlerosCoreBase.WhenNotPausedOnly.selector);
        core.pause();
    }

    function test_unpause() public {
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.unpause();

        vm.expectRevert(KlerosCoreBase.WhenPausedOnly.selector);
        vm.prank(governor);
        core.unpause();

        vm.prank(governor);
        core.pause();
        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Unpaused();
        core.unpause();
        assertEq(core.paused(), false, "Wrong paused value");
    }

    function test_executeGovernorProposal() public {
        bytes memory data = abi.encodeWithSignature("changeGovernor(address)", other);
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.executeGovernorProposal(address(core), 0, data);

        vm.expectRevert(KlerosCoreBase.UnsuccessfulCall.selector);
        vm.prank(governor);
        core.executeGovernorProposal(address(core), 0, data); // It'll fail because the core is not its own governor

        vm.prank(governor);
        core.changeGovernor(payable(address(core)));
        vm.prank(address(core));
        core.executeGovernorProposal(address(core), 0, data);
        assertEq(core.governor(), other, "Wrong governor");
    }

    function test_changeGovernor() public {
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changeGovernor(payable(other));
        vm.prank(governor);
        core.changeGovernor(payable(other));
        assertEq(core.governor(), other, "Wrong governor");
    }

    function test_changeGuardian() public {
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changeGuardian(other);
        vm.prank(governor);
        core.changeGuardian(other);
        assertEq(core.guardian(), other, "Wrong guardian");
    }

    function test_changePinakion() public {
        PNK fakePNK = new PNK();
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changePinakion(fakePNK);
        vm.prank(governor);
        core.changePinakion(fakePNK);
        assertEq(address(core.pinakion()), address(fakePNK), "Wrong PNK");
    }

    function test_changeJurorProsecutionModule() public {
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changeJurorProsecutionModule(other);
        vm.prank(governor);
        core.changeJurorProsecutionModule(other);
        assertEq(core.jurorProsecutionModule(), other, "Wrong jurorProsecutionModule");
    }

    function test_changeSortitionModule() public {
        SortitionModuleMock fakeSM = new SortitionModuleMock();
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changeSortitionModule(fakeSM);
        vm.prank(governor);
        core.changeSortitionModule(fakeSM);
        assertEq(address(core.sortitionModule()), address(fakeSM), "Wrong sortitionModule");
    }

    function test_addNewDisputeKit() public {
        DisputeKitSybilResistant newDK = new DisputeKitSybilResistant();
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.addNewDisputeKit(newDK);
        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitCreated(2, newDK);
        core.addNewDisputeKit(newDK);
        assertEq(address(core.disputeKits(2)), address(newDK), "Wrong address of new DK");
        assertEq(core.getDisputeKitsLength(), 3, "Wrong DK array length");
    }

    function test_createCourt() public {
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = 2; // New DK is added below.
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        vm.expectRevert(KlerosCoreBase.MinStakeLowerThanParentCourt.selector);
        vm.prank(governor);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            800, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        vm.expectRevert(KlerosCoreBase.UnsupportedDisputeKit.selector);
        vm.prank(governor);
        uint256[] memory emptySupportedDK = new uint256[](0);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            emptySupportedDK
        );

        vm.expectRevert(KlerosCoreBase.InvalidForkingCourtAsParent.selector);
        vm.prank(governor);
        core.createCourt(
            FORKING_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        uint256[] memory badSupportedDK = new uint256[](2);
        badSupportedDK[0] = NULL_DISPUTE_KIT; // Include NULL_DK to check that it reverts
        badSupportedDK[1] = DISPUTE_KIT_CLASSIC;
        vm.expectRevert(KlerosCoreBase.WrongDisputeKitIndex.selector);
        vm.prank(governor);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            badSupportedDK
        );

        badSupportedDK[0] = DISPUTE_KIT_CLASSIC;
        badSupportedDK[1] = 2; // Check out of bounds index
        vm.expectRevert(KlerosCoreBase.WrongDisputeKitIndex.selector);
        vm.prank(governor);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            badSupportedDK
        );

        // Add new DK to check the requirement for classic DK
        DisputeKitSybilResistant newDK = new DisputeKitSybilResistant();
        vm.prank(governor);
        core.addNewDisputeKit(newDK);
        badSupportedDK = new uint256[](1);
        badSupportedDK[0] = 2; // Include only sybil resistant dk
        vm.expectRevert(KlerosCoreBase.MustSupportDisputeKitClassic.selector);
        vm.prank(governor);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            badSupportedDK
        );

        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitEnabled(2, DISPUTE_KIT_CLASSIC, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitEnabled(2, 2, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.CourtCreated(
            2,
            GENERAL_COURT,
            true,
            2000,
            20000,
            0.04 ether,
            50,
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Explicitly convert otherwise it throws
            supportedDK
        );
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        (
            uint96 courtParent,
            bool courtHiddenVotes,
            uint256 courtMinStake,
            uint256 courtAlpha,
            uint256 courtFeeForJuror,
            uint256 courtJurorsForCourtJump,
            bool courtDisabled
        ) = core.courts(2);
        assertEq(courtParent, GENERAL_COURT, "Wrong court parent");
        assertEq(courtHiddenVotes, true, "Wrong hiddenVotes value");
        assertEq(courtMinStake, 2000, "Wrong minStake value");
        assertEq(courtAlpha, 20000, "Wrong alpha value");
        assertEq(courtFeeForJuror, 0.04 ether, "Wrong feeForJuror value");
        assertEq(courtJurorsForCourtJump, 50, "Wrong jurorsForCourtJump value");
        assertEq(courtDisabled, false, "Court should not be disabled");

        uint256[] memory children = core.getCourtChildren(2);
        assertEq(children.length, 0, "No children");
        uint256[4] memory courtTimesPerPeriod = core.getTimesPerPeriod(2);
        assertEq(courtTimesPerPeriod[0], uint256(10), "Wrong times per period 0");
        assertEq(courtTimesPerPeriod[1], uint256(20), "Wrong times per period 1");
        assertEq(courtTimesPerPeriod[2], uint256(30), "Wrong times per period 2");
        assertEq(courtTimesPerPeriod[3], uint256(40), "Wrong times per period 3");

        children = core.getCourtChildren(GENERAL_COURT); // Check that parent updated children
        assertEq(children.length, 1, "Wrong children count");
        assertEq(children[0], 2, "Wrong child id");

        (uint256 K, uint256 nodeLength) = sortitionModule.getSortitionProperties(bytes32(uint256(2)));
        assertEq(K, 4, "Wrong tree K of the new court");
        assertEq(nodeLength, 1, "Wrong node length for created tree of the new court");
    }

    function test_changeCourtParameters() public {
        // Create a 2nd court to check the minStake requirements
        vm.prank(governor);
        uint96 newCourtID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
        );
        vm.expectRevert(KlerosCoreBase.MinStakeLowerThanParentCourt.selector);
        vm.prank(governor);
        // Min stake of a parent became higher than of a child
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            3000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
        );
        // Min stake of a child became lower than of a parent
        vm.expectRevert(KlerosCoreBase.MinStakeLowerThanParentCourt.selector);
        vm.prank(governor);
        core.changeCourtParameters(
            newCourtID,
            true, // Hidden votes
            800, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
        );

        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.CourtModified(
            GENERAL_COURT,
            true,
            2000,
            20000,
            0.04 ether,
            50,
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Explicitly convert otherwise it throws
        );
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
        );

        (
            uint96 courtParent,
            bool courtHiddenVotes,
            uint256 courtMinStake,
            uint256 courtAlpha,
            uint256 courtFeeForJuror,
            uint256 courtJurorsForCourtJump,
            bool courtDisabled
        ) = core.courts(GENERAL_COURT);
        assertEq(courtHiddenVotes, true, "Wrong hiddenVotes value");
        assertEq(courtMinStake, 2000, "Wrong minStake value");
        assertEq(courtAlpha, 20000, "Wrong alpha value");
        assertEq(courtFeeForJuror, 0.04 ether, "Wrong feeForJuror value");
        assertEq(courtJurorsForCourtJump, 50, "Wrong jurorsForCourtJump value");
        assertEq(courtDisabled, false, "Court should not be disabled");

        uint256[4] memory courtTimesPerPeriod = core.getTimesPerPeriod(GENERAL_COURT);
        assertEq(courtTimesPerPeriod[0], uint256(10), "Wrong times per period 0");
        assertEq(courtTimesPerPeriod[1], uint256(20), "Wrong times per period 1");
        assertEq(courtTimesPerPeriod[2], uint256(30), "Wrong times per period 2");
        assertEq(courtTimesPerPeriod[3], uint256(40), "Wrong times per period 3");
    }

    function test_enableDisputeKits() public {
        DisputeKitSybilResistant newDK = new DisputeKitSybilResistant();
        uint256 newDkID = 2;
        vm.prank(governor);
        core.addNewDisputeKit(newDK);

        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        vm.expectRevert(KlerosCoreBase.WrongDisputeKitIndex.selector);
        vm.prank(governor);
        supportedDK[0] = NULL_DISPUTE_KIT;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        vm.expectRevert(KlerosCoreBase.WrongDisputeKitIndex.selector);
        vm.prank(governor);
        supportedDK[0] = 3; // Out of bounds
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        vm.expectRevert(KlerosCoreBase.CannotDisableClassicDK.selector);
        vm.prank(governor);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, false);

        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitEnabled(GENERAL_COURT, newDkID, true);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);
        assertEq(core.isSupported(GENERAL_COURT, newDkID), true, "New DK should be supported by General court");

        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitEnabled(GENERAL_COURT, newDkID, false);
        core.enableDisputeKits(GENERAL_COURT, supportedDK, false);
        assertEq(core.isSupported(GENERAL_COURT, newDkID), false, "New DK should be disabled in General court");
    }

    function test_changeAcceptedFeeTokens() public {
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changeAcceptedFeeTokens(feeToken, true);

        (bool accepted, , ) = core.currencyRates(feeToken);
        assertEq(accepted, false, "Token should not be accepted yet");

        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.AcceptedFeeToken(feeToken, true);
        core.changeAcceptedFeeTokens(feeToken, true);
        (accepted, , ) = core.currencyRates(feeToken);
        assertEq(accepted, true, "Token should be accepted");
    }

    function test_changeCurrencyRates() public {
        vm.expectRevert(KlerosCoreBase.GovernorOnly.selector);
        vm.prank(other);
        core.changeCurrencyRates(feeToken, 100, 200);

        (, uint256 rateInEth, uint256 rateDecimals) = core.currencyRates(feeToken);
        assertEq(rateInEth, 0, "rateInEth should be 0");
        assertEq(rateDecimals, 0, "rateDecimals should be 0");

        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.NewCurrencyRate(feeToken, 100, 200);
        core.changeCurrencyRates(feeToken, 100, 200);

        (, rateInEth, rateDecimals) = core.currencyRates(feeToken);
        assertEq(rateInEth, 100, "rateInEth is incorrect");
        assertEq(rateDecimals, 200, "rateDecimals is incorrect");
    }

    function test_extraDataToCourtIDMinJurorsDisputeKit() public {
        // Standard values
        bytes memory extraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);

        (uint96 courtID, uint256 minJurors, uint256 disputeKitID) = core.extraDataToCourtIDMinJurorsDisputeKit(
            extraData
        );
        assertEq(courtID, GENERAL_COURT, "Wrong courtID");
        assertEq(minJurors, DEFAULT_NB_OF_JURORS, "Wrong minJurors");
        assertEq(disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong disputeKitID");

        // Botched extraData. Values should fall into standard
        extraData = "0xfa";

        (courtID, minJurors, disputeKitID) = core.extraDataToCourtIDMinJurorsDisputeKit(extraData);
        assertEq(courtID, GENERAL_COURT, "Wrong courtID");
        assertEq(minJurors, DEFAULT_NB_OF_JURORS, "Wrong minJurors");
        assertEq(disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong disputeKitID");

        // Custom values.
        vm.startPrank(governor);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        extraData = abi.encodePacked(uint256(50), uint256(41), uint256(6));

        (courtID, minJurors, disputeKitID) = core.extraDataToCourtIDMinJurorsDisputeKit(extraData);
        assertEq(courtID, GENERAL_COURT, "Wrong courtID"); // Value in extra data is out of scope so fall back
        assertEq(minJurors, 41, "Wrong minJurors");
        assertEq(disputeKitID, 6, "Wrong disputeKitID");
    }

    // *************************************** //
    // *             Staking  test           * //
    // *************************************** //

    function test_setStake_increase() public {
        vm.prank(governor);
        core.pause();
        vm.expectRevert(KlerosCoreBase.WhenNotPausedOnly.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);
        vm.prank(governor);
        core.unpause();

        vm.expectRevert(KlerosCoreBase.StakingNotPossibleInThisCourt.selector);
        vm.prank(staker1);
        core.setStake(FORKING_COURT, 1000);

        uint96 badCourtID = 2;
        vm.expectRevert(KlerosCoreBase.StakingNotPossibleInThisCourt.selector);
        vm.prank(staker1);
        core.setStake(badCourtID, 1000);

        vm.expectRevert(KlerosCoreBase.StakingLessThanCourtMinStake.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 800);

        vm.expectRevert(KlerosCoreBase.StakingZeroWhenNoStake.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 1001, 1001);
        core.setStake(GENERAL_COURT, 1001);

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1001, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1001, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        assertEq(pinakion.balanceOf(address(core)), 1001, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998999, "Wrong token balance of staker1"); // 1 eth - 1001 wei
        assertEq(pinakion.allowance(staker1, address(core)), 999999999999998999, "Wrong allowance for staker1");

        vm.expectRevert(KlerosCoreBase.StakingTransferFailed.selector); // This  error will be caught because governor didn't approve any tokens for KlerosCore
        vm.prank(governor);
        core.setStake(GENERAL_COURT, 1000);

        // Increase stake one more time to verify the correct behavior
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 2000, 2000);
        core.setStake(GENERAL_COURT, 2000);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 2000, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 2000, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Number of courts should not increase");

        assertEq(pinakion.balanceOf(address(core)), 2000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1"); // 1 eth - 2000 wei
        assertEq(pinakion.allowance(staker1, address(core)), 999999999999998000, "Wrong allowance for staker1");
    }

    function test_setStake_decrease() public {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);
        assertEq(pinakion.balanceOf(address(core)), 2000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1");
        assertEq(pinakion.allowance(staker1, address(core)), 999999999999998000, "Wrong allowance for staker1");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1500); // Decrease the stake to see if it's reflected correctly
        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1500, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1500, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        assertEq(pinakion.balanceOf(address(core)), 1500, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998500, "Wrong token balance of staker1");
        assertEq(
            pinakion.allowance(staker1, address(core)),
            999999999999998000,
            "Allowance should not change during withdrawal"
        );

        vm.prank(address(core));
        pinakion.transfer(staker1, 1); // Manually send 1 token to make the withdrawal fail

        vm.expectRevert(KlerosCoreBase.UnstakingTransferFailed.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        vm.prank(address(staker1));
        pinakion.transfer(address(core), 1); // Manually give the token back
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 0, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(nbCourts, 0, "Wrong number of courts");

        courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 0, "Wrong courts count");
        assertEq(sortitionModule.isJurorStaked(staker1), false, "Juror should not be staked");

        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");
        assertEq(
            pinakion.allowance(staker1, address(core)),
            999999999999998000,
            "Allowance should not change during withdrawal"
        );
    }

    function test_setStake_maxStakePathCheck() public {
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;

        // Create 4 courts to check the require
        for (uint96 i = GENERAL_COURT; i <= 4; i++) {
            vm.prank(governor);
            core.createCourt(
                GENERAL_COURT,
                true,
                2000,
                20000,
                0.04 ether,
                50,
                [uint256(10), uint256(20), uint256(30), uint256(40)],
                abi.encode(uint256(4)),
                supportedDK
            );
            vm.prank(staker1);
            core.setStake(i, 2000);
        }

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 4, "Wrong courts count");

        uint96 excessiveCourtID = 5;
        vm.expectRevert(KlerosCoreBase.StakingInTooManyCourts.selector);
        vm.prank(staker1);
        core.setStake(excessiveCourtID, 2000);
    }

    function test_setStake_increaseDrawingPhase() public {
        // Set the stake and create a dispute to advance the phase
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");
        assertEq(uint256(sortitionModule.phase()), uint256(ISortitionModule.Phase.drawing), "Wrong phase");

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1500);
        core.setStake(GENERAL_COURT, 1500);

        uint256 delayedStakeId = sortitionModule.delayedStakeWriteIndex();
        assertEq(delayedStakeId, 1, "Wrong delayedStakeWriteIndex");
        assertEq(sortitionModule.delayedStakeReadIndex(), 1, "Wrong delayedStakeReadIndex");
        (address account, uint96 courtID, uint256 stake, bool alreadyTransferred) = sortitionModule.delayedStakes(
            delayedStakeId
        );
        assertEq(account, staker1, "Wrong staker account");
        assertEq(courtID, GENERAL_COURT, "Wrong court id");
        assertEq(stake, 1500, "Wrong amount staked in court");
        assertEq(alreadyTransferred, false, "Should be flagged as transferred");

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1000, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1000, "Amount staked in court should not change until delayed stake is executed");
        assertEq(nbCourts, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");
    }

    function test_setStake_decreaseDrawingPhase() public {
        // Set the stake and create a dispute to advance the phase
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        assertEq(pinakion.balanceOf(address(core)), 2000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1");

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1800);
        core.setStake(GENERAL_COURT, 1800);

        (uint256 totalStaked, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 2000, "Total staked amount should not change");
        assertEq(stakedInCourt, 2000, "Amount staked in court should not change");

        assertEq(pinakion.balanceOf(address(core)), 2000, "Token balance of the core should not change");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1");
    }

    function test_setStake_LockedTokens() public {
        // Check that correct amount is taken when locked tokens amount exceeds the staked amount
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 10000, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked"); // 1000 per draw and the juror was drawn 3 times
        assertEq(stakedInCourt, 10000, "Wrong amount staked in court");

        sortitionModule.passPhase(); // Staking

        assertEq(pinakion.balanceOf(address(core)), 10000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999990000, "Wrong token balance of staker1");

        // Unstake to check that locked tokens won't be withdrawn
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 3000, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(nbCourts, 0, "Wrong amount staked in court");

        assertEq(pinakion.balanceOf(address(core)), 3000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999997000, "Wrong token balance of staker1");

        // Stake again to check the behaviour.
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 5000);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 8000, "Wrong amount total staked"); // 5000 were added to the previous 3000.
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 5000, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong amount staked in court");

        assertEq(pinakion.balanceOf(address(core)), 8000, "Wrong amount of tokens in Core");
        assertEq(pinakion.balanceOf(staker1), 999999999999992000, "Wrong token balance of staker1");
    }

    function test_executeDelayedStakes() public {
        // Stake as staker2 as well to diversify the execution of delayed stakes
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 10000);

        vm.expectRevert(bytes("No delayed stake to execute."));
        sortitionModule.executeDelayedStakes(5);

        // Set the stake and create a dispute to advance the phase
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        uint256 disputeID = 0;
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.expectRevert(bytes("Should be in Staking phase."));
        sortitionModule.executeDelayedStakes(5);

        // Create delayed stake
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1500);
        core.setStake(GENERAL_COURT, 1500);

        assertEq(pinakion.balanceOf(address(core)), 10000, "Wrong token balance of the core"); // Balance should not increase because the stake was delayed
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");

        // Create delayed stake for another staker
        vm.prank(staker2);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker2, GENERAL_COURT, 0);
        core.setStake(GENERAL_COURT, 0);
        assertEq(pinakion.balanceOf(staker2), 999999999999990000, "Wrong token balance of staker2"); // Balance should not change since wrong phase

        // Create another delayed stake for staker1 on top of it to check the execution
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1800);
        core.setStake(GENERAL_COURT, 1800);

        assertEq(sortitionModule.delayedStakeWriteIndex(), 3, "Wrong delayedStakeWriteIndex");
        assertEq(sortitionModule.delayedStakeReadIndex(), 1, "Wrong delayedStakeReadIndex");

        (address account, uint96 courtID, uint256 stake, bool alreadyTransferred) = sortitionModule.delayedStakes(1);

        // Check each delayed stake
        assertEq(account, staker1, "Wrong staker account for the first delayed stake");
        assertEq(courtID, GENERAL_COURT, "Wrong court ID");
        assertEq(stake, 1500, "Wrong staking amount");
        assertEq(alreadyTransferred, false, "Should be false");

        (account, courtID, stake, alreadyTransferred) = sortitionModule.delayedStakes(2);
        assertEq(account, staker2, "Wrong staker2 account");
        assertEq(courtID, GENERAL_COURT, "Wrong court id for staker2");
        assertEq(stake, 0, "Wrong amount for delayed stake of staker2");
        assertEq(alreadyTransferred, false, "Should be false");

        (account, courtID, stake, alreadyTransferred) = sortitionModule.delayedStakes(3);
        assertEq(account, staker1, "Wrong staker1 account");
        assertEq(courtID, GENERAL_COURT, "Wrong court id for staker1");
        assertEq(stake, 1800, "Wrong amount for delayed stake of staker1");
        assertEq(alreadyTransferred, false, "Should be false");

        // So far the only amount transferred was 10000 by staker2. Staker 1 has two delayed stakes, for 1500 and 1800 pnk.
        assertEq(pinakion.balanceOf(address(core)), 10000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 999999999999990000, "Wrong token balance of staker2");

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT); // Only check the first staker to check how consecutive delayed stakes are handled.
        // Balances shouldn't be updated yet.
        assertEq(totalStaked, 0, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(nbCourts, 0, "Wrong number of courts");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Staking. Delayed stakes can be executed now

        vm.prank(address(core));
        pinakion.transfer(governor, 10000); // Dispose of the tokens of 2nd staker to make the execution fail for the 2nd delayed stake
        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");

        // 2 events should be emitted but the 2nd stake supersedes the first one in the end.
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 1500, 1500);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 1800, 1800);
        sortitionModule.executeDelayedStakes(20); // Deliberately ask for more iterations than needed

        assertEq(sortitionModule.delayedStakeWriteIndex(), 3, "Wrong delayedStakeWriteIndex");
        assertEq(sortitionModule.delayedStakeReadIndex(), 4, "Wrong delayedStakeReadIndex");

        // Check that delayed stakes are nullified
        for (uint i = 2; i <= sortitionModule.delayedStakeWriteIndex(); i++) {
            (account, courtID, stake, alreadyTransferred) = sortitionModule.delayedStakes(i);

            assertEq(account, address(0), "Wrong staker account after delayed stake deletion");
            assertEq(courtID, 0, "Court id should be nullified");
            assertEq(stake, 0, "No amount to stake");
            assertEq(alreadyTransferred, false, "Should be false");
        }

        assertEq(pinakion.balanceOf(staker1), 999999999999998200, "Wrong token balance of staker1");

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1800, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1800, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong amount staked in court");

        // Staker2 not getting the tokens back indicates that his delayed stake was skipped and the flow wasn't disrupted
        assertEq(pinakion.balanceOf(staker2), 999999999999990000, "Wrong token balance of staker2");
    }

    function test_setStakeBySortitionModule() public {
        // Note that functionality of this function was checked during delayed stakes execution
        vm.expectRevert(KlerosCoreBase.SortitionModuleOnly.selector);
        vm.prank(governor);
        core.setStakeBySortitionModule(staker1, GENERAL_COURT, 1000);
    }

    function test_setStake_snapshotProxyCheck() public {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 12346);

        KlerosCoreSnapshotProxy snapshotProxy = new KlerosCoreSnapshotProxy(governor, IKlerosCore(address(core)));
        assertEq(snapshotProxy.name(), "Staked Pinakion", "Wrong name of the proxy token");
        assertEq(snapshotProxy.symbol(), "stPNK", "Wrong symbol of the proxy token");
        assertEq(snapshotProxy.decimals(), 18, "Wrong decimals of the proxy token");
        assertEq(snapshotProxy.governor(), msg.sender, "Wrong governor");
        assertEq(address(snapshotProxy.core()), address(core), "Wrong core in snapshot proxy");
        assertEq(snapshotProxy.balanceOf(staker1), 12346, "Wrong stPNK balance");

        vm.prank(other);
        vm.expectRevert(bytes("Access not allowed: Governor only."));
        snapshotProxy.changeCore(IKlerosCore(other));
        vm.prank(governor);
        snapshotProxy.changeCore(IKlerosCore(other));
        assertEq(address(snapshotProxy.core()), other, "Wrong core in snapshot proxy after change");

        vm.prank(other);
        vm.expectRevert(bytes("Access not allowed: Governor only."));
        snapshotProxy.changeGovernor(other);
        vm.prank(governor);
        snapshotProxy.changeGovernor(other);
        assertEq(snapshotProxy.governor(), other, "Wrong governor after change");
    }

    // *************************************** //
    // *             Disputes                * //
    // *************************************** //

    function test_createDispute_eth() public {
        // Create a new court and DK to test non-standard extra data
        uint256 newFee = 0.01 ether;
        uint96 newCourtID = 2;
        uint256 newNbJurors = 4;
        uint256 newDkID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        bytes memory newExtraData = abi.encodePacked(uint256(newCourtID), newNbJurors, newDkID);

        vm.prank(governor);
        core.addNewDisputeKit(disputeKit); // Just add the same dk to avoid dealing with initialization
        vm.prank(governor);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            newFee, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.expectRevert(KlerosCoreBase.ArbitrationFeesNotEnough.selector);
        vm.prank(disputer);
        arbitrable.createDispute{value: newFee * newNbJurors - 1}("Action");

        vm.expectRevert(KlerosCoreBase.DisputeKitNotSupportedByCourt.selector);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.04 ether}("Action");

        vm.prank(governor);
        supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(newCourtID, supportedDK, true);

        uint256 disputeID = 0;
        uint256 nbChoices = 2;
        vm.prank(disputer);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.DisputeCreation(disputeID, nbChoices, newExtraData);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.DisputeCreation(disputeID, arbitrable);
        arbitrable.createDispute{value: 0.04 ether}("Action");

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (
            uint96 courtID,
            IArbitrableV2 arbitrated,
            KlerosCoreBase.Period period,
            bool ruled,
            uint256 lastPeriodChange
        ) = core.disputes(disputeID);

        assertEq(courtID, newCourtID, "Wrong court ID");
        assertEq(address(arbitrated), address(arbitrable), "Wrong arbitrable");
        assertEq(uint256(period), uint256(KlerosCoreBase.Period.evidence), "Wrong period");
        assertEq(ruled, false, "Should not be ruled");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");
        assertEq(round.pnkAtStakePerJuror, 4000, "Wrong pnkAtStakePerJuror"); // minStake * alpha / divisor = 2000 * 20000/10000
        assertEq(round.totalFeesForJurors, 0.04 ether, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 4, "Wrong nbVotes");
        assertEq(round.repartitions, 0, "repartitions should be 0");
        assertEq(round.pnkPenalties, 0, "pnkPenalties should be 0");
        assertEq(round.sumFeeRewardPaid, 0, "sumFeeRewardPaid should be 0");
        assertEq(round.sumPnkRewardPaid, 0, "sumPnkRewardPaid should be 0");
        assertEq(address(round.feeToken), address(0), "feeToken should be 0");
        assertEq(round.drawIterations, 0, "drawIterations should be 0");

        (uint256 numberOfChoices, bool jumped, bytes memory extraData) = disputeKit.disputes(disputeID);

        assertEq(numberOfChoices, 2, "Wrong numberOfChoices");
        assertEq(jumped, false, "jumped should be false");
        assertEq(extraData, newExtraData, "Wrong extra data");
        assertEq(disputeKit.coreDisputeIDToLocal(0), disputeID, "Wrong local disputeID");
        assertEq(disputeKit.coreDisputeIDToActive(0), true, "Wrong disputes length");

        (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommited,
            uint256 nbVoters,
            uint256 choiceCount
        ) = disputeKit.getRoundInfo(0, 0, 0);
        assertEq(winningChoice, 0, "winningChoice should be 0");
        assertEq(tied, true, "tied should be true");
        assertEq(totalVoted, 0, "totalVoted should be 0");
        assertEq(totalCommited, 0, "totalCommited should be 0");
        assertEq(nbVoters, 0, "nbVoters should be 0");
        assertEq(choiceCount, 0, "choiceCount should be 0");
    }

    function test_createDispute_tokens() public {
        feeToken.transfer(disputer, 1 ether);
        vm.prank(disputer);
        feeToken.approve(address(arbitrable), 1 ether);

        vm.expectRevert(KlerosCoreBase.TokenNotAccepted.selector);
        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        vm.prank(governor);
        core.changeAcceptedFeeTokens(feeToken, true);
        vm.prank(governor);
        core.changeCurrencyRates(feeToken, 500, 3);

        vm.expectRevert(KlerosCoreBase.ArbitrationFeesNotEnough.selector);
        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether - 1);

        vm.expectRevert(KlerosCoreBase.TransferFailed.selector);
        vm.prank(address(arbitrable)); // Bypass createDispute in arbitrable to avoid transfer checks there and make the arbitrable call KC directly
        core.createDispute(2, arbitratorExtraData, feeToken, 0.18 ether);

        assertEq(core.arbitrationCost(arbitratorExtraData, feeToken), 0.18 ether, "Wrong token cost");
        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        KlerosCoreBase.Round memory round = core.getRoundInfo(0, 0);
        assertEq(round.totalFeesForJurors, 0.18 ether, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 3, "Wrong nbVotes");
        assertEq(address(round.feeToken), address(feeToken), "Wrong feeToken");

        assertEq(feeToken.balanceOf(address(core)), 0.18 ether, "Wrong token balance of the core");
        assertEq(feeToken.balanceOf(disputer), 0.82 ether, "Wrong token balance of the disputer");
    }

    function test_draw() public {
        uint256 disputeID = 0;
        uint256 roundID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1500);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker1, 1000, false);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 0); // VoteID = 0

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // Do 3 iterations and see that the juror will get drawn 3 times despite low stake.

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(
            staker1,
            GENERAL_COURT
        );
        assertEq(totalStaked, 1500, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked"); // 1000 per draw
        assertEq(stakedInCourt, 1500, "Wrong amount staked in court");
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Wrong disputesWithoutJurors count");

        for (uint256 i = 0; i < DEFAULT_NB_OF_JURORS; i++) {
            (address account, bytes32 commit, uint256 choice, bool voted) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(account, staker1, "Wrong drawn account");
            assertEq(commit, bytes32(0), "Commit should be empty");
            assertEq(choice, 0, "Choice should be empty");
            assertEq(voted, false, "Voted should be false");
        }
    }

    function test_draw_noEmptyAddresses() public {
        uint256 disputeID = 0;
        uint256 roundID = 0;

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // No one is staked so check that the empty addresses are not drawn.

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, roundID);
        assertEq(round.drawIterations, 3, "Wrong drawIterations number");

        (, , , , uint256 nbVoters, ) = disputeKit.getRoundInfo(disputeID, roundID, 0);
        assertEq(nbVoters, 0, "nbVoters should be 0");
    }

    function test_draw_parentCourts() public {
        uint96 newCourtID = 2;
        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Create a child court and stake exclusively there to check that parent courts hold drawing power.
        vm.prank(governor);
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            sortitionExtraData, // Sortition extra data
            supportedDK
        );

        uint256[] memory children = core.getCourtChildren(GENERAL_COURT);
        assertEq(children.length, 1, "Wrong children count");
        assertEq(children[0], 2, "Wrong child ID");

        vm.prank(staker1);
        core.setStake(newCourtID, 3000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action"); // Dispute uses general court by default
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID of the dispute");

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 0);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 1);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 2);
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Wrong disputesWithoutJurors count");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, roundID);
        assertEq(round.drawIterations, 3, "Wrong drawIterations number");

        (, , , , uint256 nbVoters, ) = disputeKit.getRoundInfo(disputeID, roundID, 0);
        assertEq(nbVoters, 3, "nbVoters should be 3");
    }

    function test_castCommit() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(governor);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            511, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)] // Times per period
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        uint256 YES = 1;
        uint256 salt = 123455678;
        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        bytes32 commit;
        vm.prank(staker1);
        vm.expectRevert(bytes("The dispute should be in Commit period."));
        disputeKit.castCommit(disputeID, voteIDs, commit);

        vm.expectRevert(KlerosCoreBase.EvidenceNotPassedAndNotAppeal.selector);
        core.passPeriod(disputeID);
        vm.warp(block.timestamp + timesPerPeriod[0]);

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.commit);
        core.passPeriod(disputeID);

        (, , KlerosCoreBase.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);

        assertEq(uint256(period), uint256(KlerosCoreBase.Period.commit), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        vm.prank(staker1);
        vm.expectRevert(bytes("Empty commit."));
        disputeKit.castCommit(disputeID, voteIDs, commit);

        commit = keccak256(abi.encodePacked(YES, salt));

        vm.prank(other);
        vm.expectRevert(bytes("The caller has to own the vote."));
        disputeKit.castCommit(disputeID, voteIDs, commit);

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.CommitCast(disputeID, staker1, voteIDs, commit);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        (, , , uint256 totalCommited, uint256 nbVoters, uint256 choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalCommited, 1, "totalCommited should be 1");
        assertEq(disputeKit.areCommitsAllCast(disputeID), false, "Commits should not all be cast");

        (, bytes32 commitStored, , ) = disputeKit.getVoteInfo(0, 0, 0);
        assertEq(commitStored, keccak256(abi.encodePacked(YES, salt)), "Incorrect commit");

        voteIDs = new uint256[](2); // Create the leftover votes subset
        voteIDs[0] = 1;
        voteIDs[1] = 2;

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.CommitCast(disputeID, staker1, voteIDs, commit);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        (, , , totalCommited, nbVoters, choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalCommited, DEFAULT_NB_OF_JURORS, "totalCommited should be 3");
        assertEq(disputeKit.areCommitsAllCast(disputeID), true, "Commits should all be cast");

        for (uint256 i = 1; i < DEFAULT_NB_OF_JURORS; i++) {
            (, commitStored, , ) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(commitStored, keccak256(abi.encodePacked(YES, salt)), "Incorrect commit");
        }

        // Check reveal in the next period
        core.passPeriod(disputeID);

        // Check the require with the wrong choice and then with the wrong salt
        vm.prank(staker1);
        vm.expectRevert(bytes("The vote hash must match the commitment in courts with hidden votes."));
        disputeKit.castVote(disputeID, voteIDs, 2, salt, "XYZ");

        vm.prank(staker1);
        vm.expectRevert(bytes("The vote hash must match the commitment in courts with hidden votes."));
        disputeKit.castVote(disputeID, voteIDs, YES, salt - 1, "XYZ");

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, YES, salt, "XYZ");

        for (uint256 i = 1; i < DEFAULT_NB_OF_JURORS; i++) {
            // 0 voteID was skipped when casting a vote
            (address account, , uint256 choice, bool voted) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(account, staker1, "Wrong drawn account");
            assertEq(choice, YES, "Wrong choice");
            assertEq(voted, true, "Voted should be true");
        }
    }

    function test_castCommit_timeoutCheck() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(governor);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            511, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)] // Times per period
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Commit

        vm.expectRevert(KlerosCoreBase.CommitPeriodNotPassed.selector);
        core.passPeriod(disputeID);

        vm.warp(block.timestamp + timesPerPeriod[1]);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.vote);
        core.passPeriod(disputeID);
    }

    function test_castVote() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS - 1); // Draw less to check the require later
        vm.warp(block.timestamp + timesPerPeriod[0]);

        uint256[] memory voteIDs = new uint256[](0);
        vm.prank(staker1);
        vm.expectRevert(bytes("The dispute should be in Vote period."));
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ"); // Leave salt empty as not needed

        vm.expectRevert(KlerosCoreBase.DisputeStillDrawing.selector);
        core.passPeriod(disputeID);

        core.draw(disputeID, 1); // Draw the last juror

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.vote);
        core.passPeriod(disputeID); // Vote

        (, , KlerosCoreBase.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);

        assertEq(uint256(period), uint256(KlerosCoreBase.Period.vote), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        vm.prank(staker1);
        vm.expectRevert(bytes("No voteID provided"));
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        voteIDs = new uint256[](1);
        voteIDs[0] = 0; // Split vote IDs to see how the winner changes
        vm.prank(staker1);
        vm.expectRevert(bytes("Choice out of bounds"));
        disputeKit.castVote(disputeID, voteIDs, 2 + 1, 0, "XYZ");

        vm.prank(other);
        vm.expectRevert(bytes("The juror has to own the vote."));
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit IDisputeKit.VoteCast(disputeID, staker1, voteIDs, 2, "XYZ");
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(staker1);
        vm.expectRevert(bytes("Vote already cast."));
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommited,
            ,
            uint256 choiceCount
        ) = disputeKit.getRoundInfo(disputeID, 0, 2);
        assertEq(winningChoice, 2, "Wrong winning choice");
        assertEq(tied, false, "tied should be false");
        assertEq(totalVoted, 1, "totalVoted should be 1");
        assertEq(totalCommited, 0, "totalCommited should be 0");
        assertEq(choiceCount, 1, "choiceCount should be 1");

        (address account, bytes32 commit, uint256 choice, bool voted) = disputeKit.getVoteInfo(0, 0, 0); // Dispute - Round - VoteID
        assertEq(account, staker1, "Wrong drawn account");
        assertEq(commit, bytes32(0), "Commit should be empty");
        assertEq(choice, 2, "Choice should be 2");
        assertEq(voted, true, "Voted should be true");

        assertEq(disputeKit.isVoteActive(0, 0, 0), true, "Vote should be active"); // Dispute - Round - VoteID

        voteIDs = new uint256[](1);
        voteIDs[0] = 1; // Cast another vote to check the tie.

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit IDisputeKit.VoteCast(disputeID, staker1, voteIDs, 1, "XYZZ");
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZZ");

        (, tied, totalVoted, , , choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 1);
        assertEq(tied, true, "tied should be true");
        assertEq(totalVoted, 2, "totalVoted should be 2");
        assertEq(choiceCount, 1, "choiceCount should be 1 for first choice");

        vm.expectRevert(KlerosCoreBase.VotePeriodNotPassed.selector);
        core.passPeriod(disputeID);

        voteIDs = new uint256[](1);
        voteIDs[0] = 2; // Cast another vote to declare a new winner.

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit IDisputeKit.VoteCast(disputeID, staker1, voteIDs, 1, "XYZZ");
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZZ");

        (winningChoice, tied, totalVoted, , , choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 1);
        assertEq(winningChoice, 1, "Wrong winning choice");
        assertEq(tied, false, "tied should be false");
        assertEq(totalVoted, 3, "totalVoted should be 3");
        assertEq(choiceCount, 2, "choiceCount should be 2 for first choice");
        assertEq(disputeKit.areVotesAllCast(disputeID), true, "Votes should all be cast");
    }

    function test_castVote_timeoutCheck() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Votes

        vm.expectRevert(KlerosCoreBase.VotePeriodNotPassed.selector);
        core.passPeriod(disputeID);

        vm.warp(block.timestamp + timesPerPeriod[2]);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.AppealPossible(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.appeal);
        core.passPeriod(disputeID);
    }

    function test_castVote_rulingCheck() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Votes

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZZ");

        (uint256 ruling, bool tied, bool overridden) = disputeKit.currentRuling(disputeID);
        assertEq(ruling, 1, "Wrong ruling");
        assertEq(tied, false, "Not tied");
        assertEq(overridden, false, "Not overridden");
    }

    function test_castVote_quickPassPeriod() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(governor);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            511, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)] // Times per period
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        uint256 YES = 1;
        uint256 salt = 123455678;
        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        bytes32 commit;

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID);

        commit = keccak256(abi.encodePacked(YES, salt));

        vm.prank(staker1);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        (, , , uint256 totalCommited, uint256 nbVoters, uint256 choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalCommited, 1, "totalCommited should be 1");
        assertEq(disputeKit.areCommitsAllCast(disputeID), false, "Commits should not all be cast");

        vm.warp(block.timestamp + timesPerPeriod[1]);
        core.passPeriod(disputeID);

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, YES, salt, "XYZ");

        (, , uint256 totalVoted, , , ) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalVoted, 1, "totalVoted should be 1");
        assertEq(disputeKit.areVotesAllCast(disputeID), true, "Every committed vote was cast");

        // Should pass period by counting only committed votes.
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.appeal);
        core.passPeriod(disputeID);
    }

    function test_appeal_fundOneSide() public {
        uint256 disputeID = 0;
        vm.deal(address(disputeKit), 1 ether);
        vm.deal(staker1, 1 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        (uint256 start, uint256 end) = core.appealPeriod(0);
        assertEq(start, 0, "Appeal period start should be 0");
        assertEq(end, 0, "Appeal period end should be 0");

        // Simulate the call from dispute kit to check the requires unrelated to caller
        vm.prank(address(disputeKit));
        vm.expectRevert(KlerosCoreBase.DisputeNotAppealable.selector);
        core.appeal{value: 0.21 ether}(disputeID, 2, arbitratorExtraData);

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.AppealPossible(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.appeal);
        core.passPeriod(disputeID);

        (, , KlerosCoreBase.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        (start, end) = core.appealPeriod(0);
        assertEq(uint256(period), uint256(KlerosCoreBase.Period.appeal), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");
        assertEq(core.appealCost(0), 0.21 ether, "Wrong appealCost");
        assertEq(start, lastPeriodChange, "Appeal period start is incorrect");
        assertEq(end, lastPeriodChange + timesPerPeriod[3], "Appeal period end is incorrect");

        vm.expectRevert(KlerosCoreBase.AppealPeriodNotPassed.selector);
        core.passPeriod(disputeID);

        // Simulate the call from dispute kit to check the requires unrelated to caller
        vm.prank(address(disputeKit));
        vm.expectRevert(KlerosCoreBase.AppealFeesNotEnough.selector);
        core.appeal{value: 0.21 ether - 1}(disputeID, 2, arbitratorExtraData);
        vm.deal(address(disputeKit), 0); // Nullify the balance so it doesn't get in the way.

        vm.prank(staker1);
        vm.expectRevert(KlerosCoreBase.DisputeKitOnly.selector);
        core.appeal{value: 0.21 ether}(disputeID, 2, arbitratorExtraData);

        vm.prank(crowdfunder1);
        vm.expectRevert(bytes("There is no such ruling to fund."));
        disputeKit.fundAppeal(disputeID, 3);

        vm.prank(crowdfunder1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Contribution(disputeID, 0, 1, crowdfunder1, 0.21 ether);
        disputeKit.fundAppeal{value: 0.21 ether}(disputeID, 1); // Fund the losing choice. Total cost will be 0.63 (0.21 + 0.21 * (20000/10000))

        assertEq(crowdfunder1.balance, 9.79 ether, "Wrong balance of the crowdfunder");
        assertEq(address(disputeKit).balance, 0.21 ether, "Wrong balance of the DK");
        assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No funded choices");

        vm.prank(crowdfunder1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Contribution(disputeID, 0, 1, crowdfunder1, 0.42 ether);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.ChoiceFunded(disputeID, 0, 1);
        disputeKit.fundAppeal{value: 5 ether}(disputeID, 1); // Deliberately overpay to check reimburse

        assertEq(crowdfunder1.balance, 9.37 ether, "Wrong balance of the crowdfunder");
        assertEq(address(disputeKit).balance, 0.63 ether, "Wrong balance of the DK");
        assertEq((disputeKit.getFundedChoices(disputeID)).length, 1, "One choice should be funded");
        assertEq((disputeKit.getFundedChoices(disputeID))[0], 1, "Incorrect funded choice");

        vm.prank(crowdfunder1);
        vm.expectRevert(bytes("Appeal fee is already paid."));
        disputeKit.fundAppeal(disputeID, 1);
    }

    function test_appeal_timeoutCheck() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(crowdfunder1);
        vm.expectRevert(bytes("Appeal period is over.")); // Appeal period not started yet
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1);
        core.passPeriod(disputeID);

        (uint256 start, uint256 end) = core.appealPeriod(0);

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + ((end - start) / 2 + 1));
        vm.expectRevert(bytes("Appeal period is over for loser"));
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1); // Losing choice

        disputeKit.fundAppeal(disputeID, 2); // Winning choice funding should not revert yet

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + (end - start) / 2); // Warp one more to cover the whole period
        vm.expectRevert(bytes("Appeal period is over."));
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 2);
    }

    function test_appeal_fullFundingNoSwitch() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1);

        vm.prank(crowdfunder2);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.evidence);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No funded choices in the fresh round");
        (uint256 ruling, bool tied, bool overridden) = disputeKit.currentRuling(disputeID);
        assertEq(ruling, 0, "Should be 0 ruling in the fresh round");
        assertEq(tied, true, "Should be tied");
        assertEq(overridden, false, "Not overridden");

        assertEq(address(disputeKit).balance, 0.84 ether, "Wrong balance of the DK"); // 0.63 + 0.42 - 0.21
        assertEq(address(core).balance, 0.3 ether, "Wrong balance of the core"); // 0.09 arbFee + 0.21 appealFee

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count after appeal");
        assertEq(core.getNumberOfRounds(disputeID), 2, "Wrong number of rounds");

        (, , KlerosCoreBase.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCoreBase.Period.evidence), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 1); // Check the new round
        assertEq(round.pnkAtStakePerJuror, 1000, "Wrong pnkAtStakePerJuror");
        assertEq(round.totalFeesForJurors, 0.21 ether, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 7, "Wrong nbVotes");

        core.draw(disputeID, 7);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.vote); // Check that we don't have to wait for the timeout to pass the evidence period after appeal
        core.passPeriod(disputeID);
    }

    function test_appeal_fullFundingDKCourtSwitch() public {
        uint256 disputeID = 0;
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        // Create a new DK and court to check the switch
        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address)",
            governor,
            address(core),
            address(wNative)
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        DisputeKitClassic newDisputeKit = DisputeKitClassic(address(proxyDk));

        uint96 newCourtID = 2;
        uint256 newDkID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        bytes memory newExtraData = abi.encodePacked(uint256(newCourtID), DEFAULT_NB_OF_JURORS, newDkID);

        vm.prank(governor);
        core.addNewDisputeKit(newDisputeKit);
        vm.prank(governor);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            3, // jurors for jump. Low number to ensure jump after the first appeal
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            sortitionExtraData,
            supportedDK
        );

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(governor);
        supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(newCourtID, supportedDK, true);

        vm.prank(staker1);
        core.setStake(newCourtID, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        newDisputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        newDisputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1);
        vm.prank(crowdfunder2);

        assertEq(core.isDisputeKitJumping(disputeID), true, "Should be jumping");

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.CourtJump(disputeID, 1, newCourtID, GENERAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitJump(disputeID, 1, newDkID, DISPUTE_KIT_CLASSIC);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.DisputeCreation(disputeID, 2, newExtraData);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.evidence);
        newDisputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        (, bool jumped, ) = newDisputeKit.disputes(disputeID);
        assertEq(jumped, true, "jumped should be true");
        assertEq(
            (newDisputeKit.getFundedChoices(disputeID)).length,
            2,
            "No fresh round created so the number of funded choices should be 2"
        );

        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong DK ID");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID");

        (, jumped, ) = disputeKit.disputes(disputeID);
        assertEq(jumped, false, "jumped should be false in the DK that dispute jumped to");

        // Check jump modifier
        vm.prank(address(core));
        vm.expectRevert(bytes("Dispute jumped to a parent DK!"));
        newDisputeKit.draw(disputeID, 1);

        // And check that draw in the new round works
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, 1, 0); // roundID = 1 VoteID = 0
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Wrong drawn account in the classic DK");
    }

    function test_appeal_quickPassPeriod() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3] / 2);

        // Should pass to execution period without waiting for the 2nd half of the appeal.
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.execution);
        core.passPeriod(disputeID);
    }

    function test_execute() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1500);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        // Split the stakers' votes. The first staker will get VoteID 0 and the second will take the rest.
        core.draw(disputeID, 1);

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking phase to stake the 2nd voter
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 20000);
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, 2); // Assign leftover votes to staker2

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ"); // Staker1 only got 1 vote because of low stake

        voteIDs = new uint256[](2);
        voteIDs[0] = 1;
        voteIDs[1] = 2;
        vm.prank(staker2);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.expectRevert(KlerosCoreBase.NotExecutionPeriod.selector);
        core.execute(disputeID, 0, 1);

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.prank(governor);
        core.pause();
        vm.expectRevert(KlerosCoreBase.WhenNotPausedOnly.selector);
        core.execute(disputeID, 0, 1);
        vm.prank(governor);
        core.unpause();

        assertEq(disputeKit.getCoherentCount(disputeID, 0), 2, "Wrong coherent count");
        // dispute, round, voteID, feeForJuror (not used in classic DK), pnkPerJuror (not used in classic DK)
        assertEq(disputeKit.getDegreeOfCoherence(disputeID, 0, 0, 0, 0), 0, "Wrong degree of coherence 0 vote ID");
        assertEq(disputeKit.getDegreeOfCoherence(disputeID, 0, 1, 0, 0), 10000, "Wrong degree of coherence 1 vote ID");
        assertEq(disputeKit.getDegreeOfCoherence(disputeID, 0, 2, 0, 0), 10000, "Wrong degree of coherence 2 vote ID");

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker1, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 0, -int256(1000), 0, IERC20(address(0)));
        // Check iterations for the winning staker to see the shifts
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 0, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 0, 0, IERC20(address(0)));
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 0, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 0, 0, IERC20(address(0)));
        core.execute(disputeID, 0, 3); // Do 3 iterations to check penalties first

        (uint256 totalStaked, uint256 totalLocked, , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 500, "totalStaked should be penalized"); // 1500 - 1000
        assertEq(totalLocked, 0, "Tokens should be released for staker1");
        (, totalLocked, , ) = sortitionModule.getJurorBalance(staker2, GENERAL_COURT);
        assertEq(totalLocked, 2000, "Tokens should still be locked for staker2");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 3, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker1, 0, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 0, 0, 0, IERC20(address(0)));
        // Check iterations for the winning staker to see the shifts
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 500, 0.045 ether, IERC20(address(0)));
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 500, 0.045 ether, IERC20(address(0)));
        core.execute(disputeID, 0, 10); // Finish the iterations. We need only 3 but check that it corrects the count.

        (, totalLocked, , ) = sortitionModule.getJurorBalance(staker2, GENERAL_COURT);
        assertEq(totalLocked, 0, "Tokens should be unlocked for staker2");

        round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 6, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 1000, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 0, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(staker2.balance, 0.09 ether, "Wrong balance of the staker2");

        assertEq(pinakion.balanceOf(address(core)), 20500, "Wrong token balance of the core"); // Was 21500. 1000 was transferred to staker2
        assertEq(pinakion.balanceOf(staker1), 999999999999998500, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 999999999999981000, "Wrong token balance of staker2"); // 20k stake and 1k added as a reward, thus -19k from the default
    }

    function test_execute_NoCoherence() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        vm.warp(block.timestamp + timesPerPeriod[2]); // Don't vote at all so no one is coherent
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        assertEq(disputeKit.getCoherentCount(disputeID, 0), 0, "Wrong coherent count");
        // dispute, round, voteID, feeForJuror (not used in classic DK), pnkPerJuror (not used in classic DK)
        assertEq(disputeKit.getDegreeOfCoherence(disputeID, 0, 0, 0, 0), 0, "Wrong degree of coherence 0 vote ID");
        assertEq(disputeKit.getDegreeOfCoherence(disputeID, 0, 1, 0, 0), 0, "Wrong degree of coherence 1 vote ID");
        assertEq(disputeKit.getDegreeOfCoherence(disputeID, 0, 2, 0, 0), 0, "Wrong degree of coherence 2 vote ID");

        uint256 governorBalance = governor.balance;
        uint256 governorTokenBalance = pinakion.balanceOf(governor);

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.LeftoverRewardSent(disputeID, 0, 3000, 0.09 ether, IERC20(address(0)));
        core.execute(disputeID, 0, 3);

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 3000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 0, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(governor.balance, governorBalance + 0.09 ether, "Wrong balance of the governor");

        assertEq(pinakion.balanceOf(address(core)), 17000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999980000, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(governor), governorTokenBalance + 3000, "Wrong token balance of governor");
    }

    function test_execute_UnstakeInactive() public {
        // Create a 2nd court so unstaking is done in multiple courts.
        vm.prank(governor);
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            sortitionExtraData, // Sortition extra data
            supportedDK
        );

        uint256 disputeID = 0;
        uint96 newCourtID = 2;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(staker1);
        core.setStake(newCourtID, 20000);
        (, , , uint256 nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(nbCourts, 2, "Wrong number of courts");

        assertEq(pinakion.balanceOf(address(core)), 40000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999960000, "Wrong token balance of staker1");

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        sortitionModule.passPhase(); // Staking phase. Change to staking so we don't have to deal with delayed stakes.

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        vm.warp(block.timestamp + timesPerPeriod[2]); // Don't vote at all so no one is coherent
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        uint256 governorTokenBalance = pinakion.balanceOf(governor);

        // Note that these events are emitted only after the first iteration of execute() therefore the juror has been penalized only for 1000 PNK her.
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, newCourtID, 0, 19000); // Starting with 40000 we first nullify the stake and remove 20000 and then remove penalty once since there was only first iteration (40000 - 20000 - 1000)
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 0, 2000); // 2000 PNK should remain in balance to cover penalties since the first 1000 of locked pnk was already unlocked
        core.execute(disputeID, 0, 3);

        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999997000, "Wrong token balance of staker1"); // 3000 locked PNK was withheld by the contract and given to governor.
        assertEq(pinakion.balanceOf(governor), governorTokenBalance + 3000, "Wrong token balance of governor");

        (, , , nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(nbCourts, 0, "Should unstake from all courts");
    }

    function test_execute_UnstakeInsolvent() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        (uint256 totalStaked, uint256 totalLocked, , uint256 nbCourts) = sortitionModule.getJurorBalance(
            staker1,
            GENERAL_COURT
        );
        assertEq(totalStaked, 1000, "Wrong totalStaked");
        assertEq(totalLocked, 3000, "totalLocked should exceed totalStaked"); // Juror only staked 1000 but was drawn 3x of minStake (3000 locked)
        assertEq(nbCourts, 1, "Wrong number of courts");

        sortitionModule.passPhase(); // Staking phase. Change to staking so we don't have to deal with delayed stakes.

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ"); // 1 incoherent vote should make the juror insolvent

        voteIDs = new uint256[](2);
        voteIDs[0] = 1;
        voteIDs[1] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 0, 0); // Juror should have no stake left and should be unstaked from the court automatically.
        core.execute(disputeID, 0, 6);

        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1"); // The juror should have his penalty back as a reward

        (, , , nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(nbCourts, 0, "Should unstake from all courts");
    }

    function test_execute_withdrawLeftoverPNK() public {
        // Return the previously locked tokens
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        sortitionModule.passPhase(); // Staking. Pass the phase so the juror can unstake before execution

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0); // Set stake to 0 to check if it will be withdrawn later.

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1000, "Wrong amount staked");
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Should be unstaked");
        assertEq(nbCourts, 0, "Should be 0 courts");

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");

        vm.expectRevert(bytes("Not eligible for withdrawal."));
        sortitionModule.withdrawLeftoverPNK(staker1);

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.LeftoverPNK(staker1, 1000);
        core.execute(disputeID, 0, 6);

        (totalStaked, totalLocked, , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1000, "Wrong amount staked");
        assertEq(totalLocked, 0, "Should be fully unlocked");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 0, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid"); // No penalty so no rewards in pnk

        // Execute() shouldn't withdraw the tokens.
        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");

        vm.expectRevert(KlerosCoreBase.SortitionModuleOnly.selector);
        vm.prank(governor);
        core.transferBySortitionModule(staker1, 1000);

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.LeftoverPNKWithdrawn(staker1, 1000);
        sortitionModule.withdrawLeftoverPNK(staker1);

        (totalStaked, , , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 0, "Should be unstaked fully");

        // Check that everything is withdrawn now
        assertEq(pinakion.balanceOf(address(core)), 0, "Core balance should be empty");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "All PNK should be withdrawn");
    }

    function test_execute_feeToken() public {
        uint256 disputeID = 0;

        feeToken.transfer(disputer, 1 ether);
        vm.prank(disputer);
        feeToken.approve(address(arbitrable), 1 ether);

        vm.prank(governor);
        core.changeAcceptedFeeTokens(feeToken, true);
        vm.prank(governor);
        core.changeCurrencyRates(feeToken, 500, 3);

        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ"); // Staker1 only got 1 vote because of low stake

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        // Check only once per penalty and per reward
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 10000, 0, 0, feeToken);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 10000, 0, 0.06 ether, feeToken);
        core.execute(disputeID, 0, 6);

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.sumFeeRewardPaid, 0.18 ether, "Wrong sumFeeRewardPaid");

        assertEq(feeToken.balanceOf(address(core)), 0, "Wrong fee token balance of the core");
        assertEq(feeToken.balanceOf(staker1), 0.18 ether, "Wrong fee token balance of staker1");
        assertEq(feeToken.balanceOf(disputer), 0.82 ether, "Wrong fee token balance of disputer");
    }

    function test_execute_NoCoherence_feeToken() public {
        uint256 disputeID = 0;

        feeToken.transfer(disputer, 1 ether);
        vm.prank(disputer);
        feeToken.approve(address(arbitrable), 1 ether);

        vm.prank(governor);
        core.changeAcceptedFeeTokens(feeToken, true);
        vm.prank(governor);
        core.changeCurrencyRates(feeToken, 500, 3);

        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        vm.warp(block.timestamp + timesPerPeriod[2]); // Don't vote at all so no one is coherent
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.LeftoverRewardSent(disputeID, 0, 3000, 0.18 ether, feeToken);
        core.execute(disputeID, 0, 10); // Put more iterations to check that they're capped

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 3000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid");
        assertEq(round.repartitions, 3, "Wrong repartitions");

        assertEq(feeToken.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(feeToken.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(feeToken.balanceOf(disputer), 0.82 ether, "Wrong token balance of disputer");
        assertEq(feeToken.balanceOf(governor), 0.18 ether, "Wrong token balance of governor");
    }

    function test_executeRuling() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.expectRevert(KlerosCoreBase.NotExecutionPeriod.selector);
        core.executeRuling(disputeID);

        vm.warp(block.timestamp + timesPerPeriod[3]);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.execution);
        core.passPeriod(disputeID); // Execution

        (, , KlerosCoreBase.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCoreBase.Period.execution), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        vm.expectRevert(KlerosCoreBase.DisputePeriodIsFinal.selector);
        core.passPeriod(disputeID);

        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.Ruling(arbitrable, disputeID, 2); // Winning choice = 2
        vm.expectEmit(true, true, true, true);
        emit IArbitrableV2.Ruling(core, disputeID, 2);
        core.executeRuling(disputeID);

        vm.expectRevert(KlerosCoreBase.RulingAlreadyExecuted.selector);
        core.executeRuling(disputeID);

        (, , , bool ruled, ) = core.disputes(disputeID);
        assertEq(ruled, true, "Should be ruled");
    }

    function test_executeRuling_appealSwitch() public {
        // Check that the ruling switches if only one side was funded
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1); // Fund the losing choice

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.Ruling(arbitrable, disputeID, 1); // Winning choice is switched to 1
        vm.expectEmit(true, true, true, true);
        emit IArbitrableV2.Ruling(core, disputeID, 1);
        core.executeRuling(disputeID);

        (uint256 ruling, bool tied, bool overridden) = disputeKit.currentRuling(disputeID);
        assertEq(ruling, 1, "Wrong ruling");
        assertEq(tied, false, "Not tied");
        assertEq(overridden, true, "Should be overridden");
    }

    function test_withdrawFeesAndRewards() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1); // Fund the losing choice. The ruling will be overridden here
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.41 ether}(disputeID, 2); // Underpay a bit to not create an appeal and withdraw the funded sum fully

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectRevert(bytes("Dispute should be resolved."));
        disputeKit.withdrawFeesAndRewards(disputeID, payable(staker1), 0, 1);

        core.executeRuling(disputeID);

        vm.prank(governor);
        core.pause();
        vm.expectRevert(bytes("Core is paused"));
        disputeKit.withdrawFeesAndRewards(disputeID, payable(staker1), 0, 1);
        vm.prank(governor);
        core.unpause();

        assertEq(crowdfunder1.balance, 9.37 ether, "Wrong balance of the crowdfunder1");
        assertEq(crowdfunder2.balance, 9.59 ether, "Wrong balance of the crowdfunder2");
        assertEq(address(disputeKit).balance, 1.04 ether, "Wrong balance of the DK");

        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Withdrawal(disputeID, 0, 1, crowdfunder1, 0.63 ether);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 0, 1);

        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Withdrawal(disputeID, 0, 2, crowdfunder2, 0.41 ether);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 0, 2);

        assertEq(crowdfunder1.balance, 10 ether, "Wrong balance of the crowdfunder1");
        assertEq(crowdfunder2.balance, 10 ether, "Wrong balance of the crowdfunder2");
        assertEq(address(disputeKit).balance, 0, "Wrong balance of the DK");
    }

    function test_castVote_differentDK() public {
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        // Create a new DK to check castVote.
        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address)",
            governor,
            address(core),
            address(wNative)
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        DisputeKitClassic newDisputeKit = DisputeKitClassic(address(proxyDk));

        vm.prank(governor);
        core.addNewDisputeKit(newDisputeKit);

        uint256 newDkID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        bytes memory newExtraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, newDkID);

        vm.prank(governor);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitEnabled(GENERAL_COURT, newDkID, true);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);
        assertEq(core.isSupported(GENERAL_COURT, newDkID), true, "New DK should be supported by General court");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        // Create one dispute for the old DK and two disputes for the new DK.
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        uint256 disputeID = 2; // Use the latest dispute for reference. This is the ID in the core contract

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        // Draw jurors for the old DK as well to prepare round.votes array
        core.draw(0, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        // Check that the new DK has the info but not the old one.

        assertEq(disputeKit.coreDisputeIDToActive(disputeID), false, "Should be false for old DK");

        // This is the DK where dispute was created. Core dispute points to index 1 because new DK has two disputes.
        assertEq(newDisputeKit.coreDisputeIDToLocal(disputeID), 1, "Wrong local dispute ID for new DK");
        assertEq(newDisputeKit.coreDisputeIDToActive(disputeID), true, "Should be active for new DK");
        (uint256 numberOfChoices, , bytes memory extraData) = newDisputeKit.disputes(1);
        assertEq(numberOfChoices, 2, "Wrong numberOfChoices in new DK");
        assertEq(extraData, newExtraData, "Wrong extra data");

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        // Deliberately cast votes using the old DK to see if the exception will be caught.
        vm.prank(staker1);
        vm.expectRevert(bytes("Not active for core dispute ID"));
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        // And check the new DK.
        vm.prank(staker1);
        newDisputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommited,
            ,
            uint256 choiceCount
        ) = newDisputeKit.getRoundInfo(disputeID, 0, 2);
        assertEq(winningChoice, 2, "Wrong winning choice");
        assertEq(tied, false, "tied should be false");
        assertEq(totalVoted, 3, "totalVoted should be 3");
        assertEq(totalCommited, 0, "totalCommited should be 0");
        assertEq(choiceCount, 3, "choiceCount should be 3");
    }
}
