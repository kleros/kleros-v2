// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol"; // Import the console for logging
import {KlerosCoreMock} from "../../src/test/KlerosCoreMock.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {IArbitratorV2} from "../../src/arbitration/interfaces/IArbitratorV2.sol";
import {IDisputeKit} from "../../src/arbitration/interfaces/IDisputeKit.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {CentralizedKit} from "../../src/arbitration/dispute-kits/CentralizedKit.sol";
import {DisputeKitSybilResistant} from "../../src/arbitration/dispute-kits/DisputeKitSybilResistant.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import {SortitionModuleMock, SortitionModule} from "../../src/test/SortitionModuleMock.sol";
import {BlockHashRNG} from "../../src/rng/BlockhashRNG.sol";
import {RNGMock} from "../../src/test/RNGMock.sol";
import {PNK} from "../../src/token/PNK.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {ArbitrableExample, IArbitrableV2} from "../../src/arbitration/arbitrables/ArbitrableExample.sol";
import {DisputeTemplateRegistry} from "../../src/arbitration/DisputeTemplateRegistry.sol";
import {IKlerosCore, KlerosCoreSnapshotProxy} from "../../src/arbitration/view/KlerosCoreSnapshotProxy.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_TestBase
/// @dev Abstract base contract for KlerosCore tests containing shared setup and utilities
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
abstract contract KlerosCore_TestBase is Test {
    event Initialized(uint64 version);

    // ************************************* //
    // *          Test Contracts           * //
    // ************************************* //

    KlerosCoreMock core;
    DisputeKitClassic disputeKit;
    CentralizedKit centralizedKit;
    SortitionModuleMock sortitionModule;
    BlockHashRNG rng;
    PNK pinakion;
    TestERC20 wNative;
    ArbitrableExample arbitrable;
    DisputeTemplateRegistry registry;

    // ************************************* //
    // *            Test Accounts          * //
    // ************************************* //

    address owner;
    address staker1;
    address staker2;
    address disputer;
    address crowdfunder1;
    address crowdfunder2;
    address ruler;
    address other;

    // ************************************* //
    // *         Test Parameters           * //
    // ************************************* //

    uint256 minStake;
    uint256 alpha;
    uint256 feeForJuror;
    uint256 jurorsForCourtJump;
    bytes arbitratorExtraData;
    uint256[4] timesPerPeriod;
    uint256[4] finalCourtTimesPerPeriod;
    bool hiddenVotes;
    uint256 totalSupply = 1000000 ether;
    uint256 minStakingTime;
    uint256 maxDrawingTime;
    uint256 rngLookahead; // Time in seconds
    uint256 stakingDelay;
    string templateData;
    string templateDataMappings;

    function setUp() public virtual {
        KlerosCoreMock coreLogic = new KlerosCoreMock();
        SortitionModuleMock smLogic = new SortitionModuleMock();
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        CentralizedKit centralDkLogic = new CentralizedKit();
        DisputeTemplateRegistry registryLogic = new DisputeTemplateRegistry();
        pinakion = new PNK();
        wNative = new TestERC20("wrapped ETH", "wETH");

        owner = msg.sender;
        staker1 = vm.addr(2);
        staker2 = vm.addr(3);
        disputer = vm.addr(4);
        crowdfunder1 = vm.addr(5);
        crowdfunder2 = vm.addr(6);
        ruler = vm.addr(7);
        vm.deal(disputer, 10 ether);
        vm.deal(crowdfunder1, 10 ether);
        vm.deal(crowdfunder2, 10 ether);
        other = vm.addr(9);
        minStake = 1000;
        alpha = 10000;
        feeForJuror = 0.03 ether;
        jurorsForCourtJump = 511;
        timesPerPeriod = [60, 120, 180, 240];
        finalCourtTimesPerPeriod = [0, 0, 0, 0];

        pinakion.transfer(msg.sender, totalSupply - 2 ether);
        pinakion.transfer(staker1, 1 ether);
        pinakion.transfer(staker2, 1 ether);

        minStakingTime = 18;
        maxDrawingTime = 24;
        hiddenVotes = false;

        rngLookahead = 30;
        rng = new BlockHashRNG(msg.sender, address(sortitionModule), rngLookahead);

        stakingDelay = 33;

        TransparentUpgradeableProxy proxyCore = new TransparentUpgradeableProxy(address(coreLogic), owner, "");

        bytes memory initDataCentralDk = abi.encodeWithSignature(
            "initialize(address,address,address)",
            address(proxyCore),
            ruler,
            address(wNative)
        );

        TransparentUpgradeableProxy proxyCentralDk = new TransparentUpgradeableProxy(
            address(centralDkLogic),
            owner,
            initDataCentralDk
        );
        centralizedKit = CentralizedKit(payable(address(proxyCentralDk)));

        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(proxyCore),
            address(wNative),
            FINAL_DISPUTE_KIT
        );

        TransparentUpgradeableProxy proxyDk = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk);
        disputeKit = DisputeKitClassic(address(proxyDk));

        bytes memory initDataSm = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,address,uint256)",
            owner,
            address(proxyCore),
            minStakingTime,
            maxDrawingTime,
            rng,
            stakingDelay
        );

        TransparentUpgradeableProxy proxySm = new TransparentUpgradeableProxy(address(smLogic), owner, initDataSm);
        sortitionModule = SortitionModuleMock(address(proxySm));
        vm.prank(owner);
        rng.changeConsumer(address(sortitionModule));
        vm.prank(owner); // Use the owner to deploy converter, to avoid modifying permission tests.

        core = KlerosCoreMock(address(proxyCore));
        core.initialize(
            payable(owner),
            pinakion,
            disputeKit,
            centralizedKit,
            hiddenVotes,
            [minStake, alpha, feeForJuror, jurorsForCourtJump],
            timesPerPeriod,
            finalCourtTimesPerPeriod,
            sortitionModule,
            address(wNative)
        );
        vm.startPrank(staker1);
        pinakion.approve(address(core), 1 ether);
        core.depositTokens(1 ether);
        vm.stopPrank();

        vm.startPrank(staker2);
        pinakion.approve(address(core), 1 ether);
        core.depositTokens(1 ether);
        vm.stopPrank();

        templateData = "AAA";
        templateDataMappings = "BBB";
        arbitratorExtraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);

        bytes memory initDataRegistry = "";
        TransparentUpgradeableProxy proxyRegistry = new TransparentUpgradeableProxy(
            address(registryLogic),
            owner,
            initDataRegistry
        );
        registry = DisputeTemplateRegistry(address(proxyRegistry));

        arbitrable = new ArbitrableExample(core, templateData, templateDataMappings, arbitratorExtraData, registry);
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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        return core.getLatestCourtID();
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
        uint256 courtParamsLength
    ) internal view {
        (uint96 courtParent, uint256 courtMinStake, uint256 courtAlpha, uint256 courtFeeForJuror, ) = core.courts(
            courtId
        );

        assertEq(courtParent, expectedParent, "Wrong court parent");
        assertEq(courtMinStake, expectedMinStake, "Wrong minStake value");
        assertEq(courtAlpha, expectedAlpha, "Wrong alpha value");
        assertEq(courtFeeForJuror, expectedFeeForJuror, "Wrong feeForJuror value");
        // Before asserting check that the court has additional court parameters initialized (e.g Final court doesn't)
        if (courtParamsLength > 0) {
            KlerosCore.AdditionalCourtParams memory courtParams = core.getAdditionalCourtParams(
                courtId,
                courtParamsLength - 1
            );
            assertEq(courtParams.hiddenVotes, expectedHiddenVotes, "Wrong hiddenVotes value");
            assertEq(courtParams.jurorsForCourtJump, expectedJurorsForJump, "Wrong jurorsForCourtJump value");
        }
    }

    /// @dev Helper function to check times per period
    function _assertTimesPerPeriod(uint96 courtId, uint256[4] memory expectedTimes) internal view {
        uint256[4] memory courtTimesPerPeriod = core.getTimesPerPeriod(courtId);
        for (uint256 i = 0; i < 4; i++) {
            assertEq(courtTimesPerPeriod[i], expectedTimes[i], "Wrong times per period");
        }
    }
}
