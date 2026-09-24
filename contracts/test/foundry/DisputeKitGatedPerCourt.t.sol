// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {KlerosCoreMock, KlerosCoreBase} from "../../src/test/KlerosCoreMock.sol";
import {DisputeKitClassic, DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {DisputeKitGatedPerCourt, IPassportDecoder} from "../../src/arbitration/dispute-kits/DisputeKitGatedPerCourt.sol";
import {PassportDecoderMock, PassportDecoderImplMock, PassportResolverMock, DelegateProxyMock} from "../../src/test/PassportDecoderMock.sol";
import {SortitionModuleMock} from "../../src/test/SortitionModuleMock.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {Initializable} from "../../src/proxy/Initializable.sol";
import {BlockHashRNG} from "../../src/rng/BlockHashRNG.sol";
import {PNK} from "../../src/token/PNK.sol";
import {TestERC20} from "../../src/token/TestERC20.sol";
import {TestERC721} from "../../src/token/TestERC721.sol";
import {TestERC1155} from "../../src/token/TestERC1155.sol";
import {ArbitrableExample} from "../../src/arbitration/arbitrables/ArbitrableExample.sol";
import {DisputeTemplateRegistry} from "../../src/arbitration/DisputeTemplateRegistry.sol";
import "../../src/libraries/Constants.sol";

/// @dev Standalone suite (not inheriting KlerosCoreTest, which would re-run its whole suite under this contract).
/// Court layout used by most tests:
///   GENERAL_COURT (1) <- PARENT_COURT (2) <- CHILD_COURT (3, jurorsForCourtJump = 3)
/// DisputeKitGatedPerCourt is registered as dispute kit 2 and enabled on both PARENT_COURT and CHILD_COURT,
/// unless a test says otherwise.
contract DisputeKitGatedPerCourtTest is Test {
    event Initialized(uint64 version);

    uint96 constant PARENT_COURT = 2;
    uint96 constant CHILD_COURT = 3;
    uint256 constant GATED_DK_ID = 2;
    uint256 constant STAKE = 20000;
    uint256 constant FEE_FOR_JUROR = 0.03 ether;
    uint256 constant MIN_PASSPORT_SCORE = 200000; // 20 with 4 decimals
    uint256 constant NESTED_DECODER_WORK_ITERATIONS = 500; // getScore() of the nested decoder: ~59k gas warm, ~71k cold

    KlerosCoreMock core;
    DisputeKitClassic disputeKitClassic;
    DisputeKitGatedPerCourt gatedDK;
    SortitionModuleMock sortitionModule;
    BlockHashRNG rng;
    PNK pinakion;
    TestERC20 feeToken;
    TestERC20 wNative;
    TestERC20 gateERC20;
    TestERC721 gateERC721;
    TestERC1155 gateERC1155;
    PassportDecoderMock passportDecoder;
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

    uint256 minStakingTime = 18;
    uint256 maxDrawingTime = 24;
    uint256 rngLookahead = 30;
    uint256[4] timesPerPeriod = [uint256(60), uint256(120), uint256(180), uint256(240)];
    bytes sortitionExtraData = abi.encode(uint256(5));

    function setUp() public {
        governor = msg.sender;
        guardian = vm.addr(1);
        staker1 = vm.addr(2);
        staker2 = vm.addr(3);
        disputer = vm.addr(4);
        crowdfunder1 = vm.addr(5);
        crowdfunder2 = vm.addr(6);
        jurorProsecutionModule = vm.addr(8);
        other = vm.addr(9);
        vm.deal(disputer, 10 ether);
        vm.deal(crowdfunder1, 10 ether);
        vm.deal(crowdfunder2, 10 ether);

        pinakion = new PNK();
        feeToken = new TestERC20("Test", "TST");
        wNative = new TestERC20("wrapped ETH", "wETH");
        pinakion.transfer(staker1, 1 ether);
        pinakion.transfer(staker2, 1 ether);

        // Gate tokens, owned/minted by this test contract.
        gateERC20 = new TestERC20("Gate20", "G20");
        gateERC721 = new TestERC721("Gate721", "G721");
        gateERC1155 = new TestERC1155();
        passportDecoder = new PassportDecoderMock();

        UUPSProxy proxyCore = new UUPSProxy(address(new KlerosCoreMock()), "");
        rng = new BlockHashRNG(msg.sender, address(0), rngLookahead);

        disputeKitClassic = DisputeKitClassic(
            address(
                new UUPSProxy(
                    address(new DisputeKitClassic()),
                    abi.encodeWithSignature(
                        "initialize(address,address,address)",
                        governor,
                        address(proxyCore),
                        address(wNative)
                    )
                )
            )
        );

        sortitionModule = SortitionModuleMock(
            address(
                new UUPSProxy(
                    address(new SortitionModuleMock()),
                    abi.encodeWithSignature(
                        "initialize(address,address,uint256,uint256,address)",
                        governor,
                        address(proxyCore),
                        minStakingTime,
                        maxDrawingTime,
                        rng
                    )
                )
            )
        );
        vm.prank(governor);
        rng.changeConsumer(address(sortitionModule));

        core = KlerosCoreMock(address(proxyCore));
        core.initialize(
            governor,
            guardian,
            pinakion,
            jurorProsecutionModule,
            disputeKitClassic,
            false, // hiddenVotes
            [uint256(1000), uint256(10000), FEE_FOR_JUROR, uint256(511)], // minStake, alpha, feeForJuror, jurorsForCourtJump
            timesPerPeriod,
            sortitionExtraData,
            sortitionModule,
            address(wNative)
        );

        gatedDK = DisputeKitGatedPerCourt(
            address(new UUPSProxy(address(new DisputeKitGatedPerCourt()), _dkInitData()))
        );
        vm.prank(governor);
        core.addNewDisputeKit(gatedDK);

        _createCourt(GENERAL_COURT, 511); // PARENT_COURT
        _createCourt(PARENT_COURT, 3); // CHILD_COURT, jumps after the first appeal
        _enableGatedDK(PARENT_COURT);
        _enableGatedDK(CHILD_COURT);

        vm.prank(staker1);
        pinakion.approve(address(core), 1 ether);
        vm.prank(staker2);
        pinakion.approve(address(core), 1 ether);

        DisputeTemplateRegistry registryLogic = new DisputeTemplateRegistry();
        registry = DisputeTemplateRegistry(
            address(new UUPSProxy(address(registryLogic), abi.encodeWithSignature("initialize(address)", governor)))
        );
        arbitrable = new ArbitrableExample(core, "AAA", "BBB", _extraData(CHILD_COURT), registry, feeToken);
    }

    // ************************************* //
    // *             Helpers               * //
    // ************************************* //

    function _dkInitData() internal view returns (bytes memory) {
        return _dkInitData(address(passportDecoder));
    }

    function _dkInitData(address _passportDecoder) internal view returns (bytes memory) {
        return
            abi.encodeWithSignature(
                "initialize(address,address,address,address)",
                governor,
                address(core),
                address(wNative),
                _passportDecoder
            );
    }

    function _createCourt(uint96 _parent, uint256 _jurorsForCourtJump) internal {
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        vm.prank(governor);
        core.createCourt(
            _parent,
            false, // hiddenVotes
            1000, // minStake
            10000, // alpha
            FEE_FOR_JUROR,
            _jurorsForCourtJump,
            timesPerPeriod,
            sortitionExtraData,
            supportedDK
        );
    }

    function _enableGatedDK(uint96 _courtID) internal {
        uint256[] memory dks = new uint256[](1);
        dks[0] = GATED_DK_ID;
        vm.prank(governor);
        core.enableDisputeKits(_courtID, dks, true);
    }

    function _setGate(uint96 _courtID, address _token, bool _isERC1155, uint256 _tokenId) internal {
        vm.prank(governor);
        gatedDK.changeCourtTokenGate(_courtID, _token, _isERC1155, _tokenId);
    }

    function _setMinPassportScore(uint96 _courtID, uint256 _minPassportScore) internal {
        vm.prank(governor);
        gatedDK.changeCourtMinPassportScore(_courtID, _minPassportScore);
    }

    function _extraData(uint96 _courtID) internal pure returns (bytes memory) {
        return abi.encodePacked(uint256(_courtID), DEFAULT_NB_OF_JURORS, GATED_DK_ID);
    }

    function _stake(address _juror, uint96 _courtID, uint256 _amount) internal {
        vm.prank(_juror);
        core.setStake(_courtID, _amount);
    }

    /// @dev Creates a dispute with the arbitrable's current extraData and moves the sortition module to drawing.
    function _createDispute() internal returns (uint256 disputeID) {
        vm.prank(disputer);
        disputeID = arbitrable.createDispute{value: FEE_FOR_JUROR * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing
    }

    function _nbVoters(uint256 _disputeID, uint256 _roundID) internal view returns (uint256 nbVoters) {
        (, , , , nbVoters, ) = gatedDK.getRoundInfo(_disputeID, _roundID, 0);
    }

    function _voter(uint256 _disputeID, uint256 _roundID, uint256 _voteID) internal view returns (address account) {
        (account, , , ) = gatedDK.getVoteInfo(_disputeID, _roundID, _voteID);
    }

    function _assertAllVotersAre(uint256 _disputeID, uint256 _roundID, address _juror) internal view {
        uint256 nbVoters = _nbVoters(_disputeID, _roundID);
        for (uint256 i = 0; i < nbVoters; i++) {
            assertEq(_voter(_disputeID, _roundID, i), _juror, "Unexpected drawn juror");
        }
    }

    function _countVotesOf(uint256 _disputeID, uint256 _roundID, address _juror) internal view returns (uint256 n) {
        uint256 nbVoters = _nbVoters(_disputeID, _roundID);
        for (uint256 i = 0; i < nbVoters; i++) {
            if (_voter(_disputeID, _roundID, i) == _juror) n++;
        }
    }

    /// @dev Round 0: every drawn juror votes choice 2, then the dispute moves to the appeal period.
    function _voteAndPassToAppeal(uint256 _disputeID) internal {
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(_disputeID); // Vote

        uint256 nbVoters = _nbVoters(_disputeID, 0);
        uint256[] memory voteIDs = new uint256[](1);
        for (uint256 i = 0; i < nbVoters; i++) {
            voteIDs[0] = i;
            vm.prank(_voter(_disputeID, 0, i));
            gatedDK.castVote(_disputeID, voteIDs, 2, 0, "XYZ");
        }
        core.passPeriod(_disputeID); // Appeal
    }

    /// @dev Funds the losing choice 1. Appeal cost with a court jump = parent feeForJuror * (2 * 3 + 1) = 0.21 ether,
    /// the loser pays 3x.
    function _fundLoser(uint256 _disputeID) internal {
        vm.prank(crowdfunder1);
        gatedDK.fundAppeal{value: 0.63 ether}(_disputeID, 1);
    }

    /// @dev Funds the winning choice 2 (2x appeal cost), which triggers the appeal in KlerosCore.
    function _fundWinnerAndAppeal(uint256 _disputeID) internal {
        vm.prank(crowdfunder2);
        gatedDK.fundAppeal{value: 0.42 ether}(_disputeID, 2);
    }

    // ************************************* //
    // *          Initialization           * //
    // ************************************* //

    function test_initialize() public {
        assertEq(gatedDK.governor(), governor, "Wrong governor");
        assertEq(address(gatedDK.core()), address(core), "Wrong core");
        assertEq(gatedDK.wNative(), address(wNative), "Wrong wNative");
        assertEq(gatedDK.version(), "0.1.0", "Wrong version");
        assertEq(gatedDK.singleDrawPerJuror(), false, "singleDrawPerJuror should be false");
        assertEq(address(core.disputeKits(GATED_DK_ID)), address(gatedDK), "Wrong DK registered");
        assertEq(address(gatedDK.passportDecoder()), address(passportDecoder), "Wrong passport decoder");

        vm.expectRevert(Initializable.AlreadyInitialized.selector);
        gatedDK.initialize(other, core, other, IPassportDecoder(other));
    }

    function test_initialize_emitsPassportDecoderChanged() public {
        DisputeKitGatedPerCourt dkLogic = new DisputeKitGatedPerCourt();
        vm.expectEmit(true, true, true, true);
        emit DisputeKitGatedPerCourt.PassportDecoderChanged(passportDecoder);
        new UUPSProxy(address(dkLogic), _dkInitData());
    }

    function test_initialize_noPassportDecoder() public {
        DisputeKitGatedPerCourt dk = DisputeKitGatedPerCourt(
            address(new UUPSProxy(address(new DisputeKitGatedPerCourt()), _dkInitData(address(0))))
        );
        assertEq(address(dk.passportDecoder()), address(0), "Passport decoder should not be set");

        // No Human Passport gating possible until a decoder is set.
        vm.startPrank(governor);
        vm.expectRevert(DisputeKitGatedPerCourt.PassportDecoderNotSet.selector);
        dk.changeCourtMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        dk.changeCourtMinPassportScore(PARENT_COURT, 0); // Ungating is fine

        dk.changePassportDecoder(passportDecoder);
        dk.changeCourtMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        vm.stopPrank();
        assertEq(dk.courtMinPassportScores(PARENT_COURT), MIN_PASSPORT_SCORE, "Wrong min score");
    }

    function test_initialize_invalidPassportDecoder() public {
        DisputeKitGatedPerCourt dkLogic = new DisputeKitGatedPerCourt();
        vm.expectRevert("Proxy Constructor failed"); // InvalidPassportDecoder: not a contract
        new UUPSProxy(address(dkLogic), _dkInitData(other));
    }

    function test_initialize_emitsInitialized() public {
        DisputeKitGatedPerCourt dkLogic = new DisputeKitGatedPerCourt();
        vm.expectEmit(true, true, true, true);
        emit Initialized(1);
        new UUPSProxy(address(dkLogic), _dkInitData());
    }

    function test_initialize_implementationDisabled() public {
        DisputeKitGatedPerCourt dkLogic = new DisputeKitGatedPerCourt();
        vm.expectRevert(Initializable.AlreadyInitialized.selector);
        dkLogic.initialize(governor, core, address(wNative), passportDecoder);
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    function test_changeCourtTokenGate_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(DisputeKitClassicBase.GovernorOnly.selector);
        gatedDK.changeCourtTokenGate(PARENT_COURT, address(gateERC721), false, 0);
    }

    function test_changeCourtTokenGate_setsGateAndEmits() public {
        vm.expectEmit(true, true, true, true);
        emit DisputeKitGatedPerCourt.CourtTokenGateChanged(PARENT_COURT, address(gateERC1155), true, 7);
        _setGate(PARENT_COURT, address(gateERC1155), true, 7);

        (address token, bool isERC1155, uint256 tokenId) = gatedDK.courtTokenGates(PARENT_COURT);
        assertEq(token, address(gateERC1155), "Wrong token");
        assertEq(isERC1155, true, "Wrong isERC1155");
        assertEq(tokenId, 7, "Wrong tokenId");

        // Other courts untouched.
        (token, isERC1155, tokenId) = gatedDK.courtTokenGates(CHILD_COURT);
        assertEq(token, address(0), "Child court should be ungated");
        assertEq(isERC1155, false, "Wrong isERC1155");
        assertEq(tokenId, 0, "Wrong tokenId");

        vm.expectEmit(true, true, true, true);
        emit DisputeKitGatedPerCourt.CourtTokenGateChanged(CHILD_COURT, address(gateERC20), false, 0);
        _setGate(CHILD_COURT, address(gateERC20), false, 0);
        (token, isERC1155, tokenId) = gatedDK.courtTokenGates(CHILD_COURT);
        assertEq(token, address(gateERC20), "Wrong token");
        assertEq(isERC1155, false, "Wrong isERC1155");
        assertEq(tokenId, 0, "Wrong tokenId");
    }

    function test_changeCourtTokenGate_resetUngates() public {
        _setGate(PARENT_COURT, address(gateERC1155), true, 7);

        vm.expectEmit(true, true, true, true);
        emit DisputeKitGatedPerCourt.CourtTokenGateChanged(PARENT_COURT, address(0), false, 0);
        _setGate(PARENT_COURT, address(0), false, 0);

        (address token, bool isERC1155, uint256 tokenId) = gatedDK.courtTokenGates(PARENT_COURT);
        assertEq(token, address(0), "Should be ungated");
        assertEq(isERC1155, false, "Wrong isERC1155");
        assertEq(tokenId, 0, "Wrong tokenId");
    }

    function test_changeCourtTokenGate_invalidTokenGate() public {
        vm.startPrank(governor);

        // No token but ERC1155 flag.
        vm.expectRevert(DisputeKitGatedPerCourt.InvalidTokenGate.selector);
        gatedDK.changeCourtTokenGate(PARENT_COURT, address(0), true, 0);

        // No token but a tokenId.
        vm.expectRevert(DisputeKitGatedPerCourt.InvalidTokenGate.selector);
        gatedDK.changeCourtTokenGate(PARENT_COURT, address(0), false, 1);

        // No token, ERC1155 flag and tokenId.
        vm.expectRevert(DisputeKitGatedPerCourt.InvalidTokenGate.selector);
        gatedDK.changeCourtTokenGate(PARENT_COURT, address(0), true, 1);

        // ERC20/ERC721 with a tokenId.
        vm.expectRevert(DisputeKitGatedPerCourt.InvalidTokenGate.selector);
        gatedDK.changeCourtTokenGate(PARENT_COURT, address(gateERC20), false, 1);

        // Not a contract: balanceOf() would revert on draw.
        vm.expectRevert(DisputeKitGatedPerCourt.InvalidTokenGate.selector);
        gatedDK.changeCourtTokenGate(PARENT_COURT, other, false, 0);

        // ERC1155 with tokenId 0 is valid.
        gatedDK.changeCourtTokenGate(PARENT_COURT, address(gateERC1155), true, 0);
        vm.stopPrank();

        (address token, bool isERC1155, uint256 tokenId) = gatedDK.courtTokenGates(PARENT_COURT);
        assertEq(token, address(gateERC1155), "Wrong token");
        assertEq(isERC1155, true, "Wrong isERC1155");
        assertEq(tokenId, 0, "Wrong tokenId");
    }

    function test_changePassportDecoder_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(DisputeKitClassicBase.GovernorOnly.selector);
        gatedDK.changePassportDecoder(passportDecoder);
    }

    function test_changePassportDecoder_setsAndEmits() public {
        PassportDecoderMock newDecoder = new PassportDecoderMock();
        vm.expectEmit(true, true, true, true);
        emit DisputeKitGatedPerCourt.PassportDecoderChanged(newDecoder);
        vm.prank(governor);
        gatedDK.changePassportDecoder(newDecoder);
        assertEq(address(gatedDK.passportDecoder()), address(newDecoder), "Wrong passport decoder");
    }

    function test_changePassportDecoder_invalid() public {
        vm.startPrank(governor);
        vm.expectRevert(DisputeKitGatedPerCourt.InvalidPassportDecoder.selector);
        gatedDK.changePassportDecoder(IPassportDecoder(address(0)));
        vm.expectRevert(DisputeKitGatedPerCourt.InvalidPassportDecoder.selector);
        gatedDK.changePassportDecoder(IPassportDecoder(other)); // Not a contract
        vm.stopPrank();
        assertEq(address(gatedDK.passportDecoder()), address(passportDecoder), "Decoder should be unchanged");
    }

    function test_changeCourtMinPassportScore_onlyGovernor() public {
        vm.prank(other);
        vm.expectRevert(DisputeKitClassicBase.GovernorOnly.selector);
        gatedDK.changeCourtMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
    }

    function test_changeCourtMinPassportScore_setsAndEmits() public {
        vm.expectEmit(true, true, true, true);
        emit DisputeKitGatedPerCourt.CourtMinPassportScoreChanged(PARENT_COURT, MIN_PASSPORT_SCORE);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        assertEq(gatedDK.courtMinPassportScores(PARENT_COURT), MIN_PASSPORT_SCORE, "Wrong min score");
        assertEq(gatedDK.courtMinPassportScores(CHILD_COURT), 0, "Child court should be ungated");

        vm.expectEmit(true, true, true, true);
        emit DisputeKitGatedPerCourt.CourtMinPassportScoreChanged(PARENT_COURT, 0);
        _setMinPassportScore(PARENT_COURT, 0);
        assertEq(gatedDK.courtMinPassportScores(PARENT_COURT), 0, "Should be ungated");
    }

    // ************************************* //
    // *              Draw                 * //
    // ************************************* //

    function test_draw_ungatedCourt() public {
        // A gate on another court must not affect this one.
        _setGate(CHILD_COURT, address(gateERC721), false, 0);
        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE); // staker1 holds no token

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 20);

        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "All votes should be drawn");
        _assertAllVotersAre(disputeID, 0, staker1);
        assertEq(core.getRoundInfo(disputeID, 0).disputeKitID, GATED_DK_ID, "Wrong DK");
    }

    function test_draw_gatedCourt_ERC20() public {
        gateERC20.transfer(staker2, 1);
        _setGate(PARENT_COURT, address(gateERC20), false, 0);
        _drawGatedAndAssert(staker2);
    }

    function test_draw_gatedCourt_ERC721() public {
        gateERC721.safeMint(staker2);
        _setGate(PARENT_COURT, address(gateERC721), false, 0);
        _drawGatedAndAssert(staker2);
    }

    function test_draw_gatedCourt_ERC1155() public {
        gateERC1155.mint(staker1, 2, 1, ""); // Wrong token ID
        gateERC1155.mint(staker2, 1, 1, "");
        _setGate(PARENT_COURT, address(gateERC1155), true, 1);
        _drawGatedAndAssert(staker2);
    }

    /// @dev Both jurors staked in PARENT_COURT, only `_holder` passes the gate.
    function _drawGatedAndAssert(address _holder) internal {
        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE);
        _stake(staker2, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 100);

        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "All votes should be drawn");
        _assertAllVotersAre(disputeID, 0, _holder);
        assertGt(core.getRoundInfo(disputeID, 0).drawIterations, DEFAULT_NB_OF_JURORS, "Non-holder never drawn?");
    }

    function test_draw_gatedCourt_noHolderStaked() public {
        gateERC721.safeMint(other); // Holder not staked
        _setGate(PARENT_COURT, address(gateERC721), false, 0);
        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE);
        _stake(staker2, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 10);

        assertEq(_nbVoters(disputeID, 0), 0, "No vote should be drawn");
        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.drawIterations, 10, "Wrong drawIterations");
        assertEq(round.drawnJurors.length, 0, "No juror should be drawn");
        (, , KlerosCoreBase.Period period, , ) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCoreBase.Period.evidence), "Dispute should remain in evidence");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Dispute should still be without jurors");
    }

    function test_draw_extraDataTokenGateIgnored() public {
        // DisputeKitGated-style extraData gating on an ERC721 that nobody holds.
        bytes memory gatedStyleExtraData = abi.encodePacked(
            uint256(PARENT_COURT),
            DEFAULT_NB_OF_JURORS,
            GATED_DK_ID,
            uint256(uint160(address(gateERC721))), // packed token gate, isERC1155 = false
            uint256(0) // tokenId
        );
        arbitrable.changeArbitratorExtraData(gatedStyleExtraData);
        _stake(staker1, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 20);

        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "extraData gate should be ignored");
        _assertAllVotersAre(disputeID, 0, staker1);
    }

    function test_draw_gateChangeAppliesToNextDraw() public {
        gateERC721.safeMint(other); // Holder not staked
        _setGate(PARENT_COURT, address(gateERC721), false, 0);
        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 10);
        assertEq(_nbVoters(disputeID, 0), 0, "Gated: no vote should be drawn");

        // Governance lifts the gate while the dispute is being drawn: applies to the remaining draws.
        _setGate(PARENT_COURT, address(0), false, 0);
        core.draw(disputeID, 10);
        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "Ungated: all votes should be drawn");
        _assertAllVotersAre(disputeID, 0, staker1);
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Dispute should be fully drawn");
    }

    function test_draw_passportGate_thresholdInclusive() public {
        passportDecoder.setScore(staker1, MIN_PASSPORT_SCORE - 1);
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        _drawGatedAndAssert(staker2);
    }

    function test_draw_passportGate_noAttestation() public {
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        _drawGatedAndAssert(staker2); // staker1 has no attestation: getScore() reverts
    }

    function test_draw_passportGate_expiredAttestation() public {
        passportDecoder.setScore(staker1, 1000000);
        passportDecoder.setExpired(staker1);
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        _drawGatedAndAssert(staker2);
    }

    function test_draw_passportGate_noEligibleStaked() public {
        passportDecoder.setScore(staker1, MIN_PASSPORT_SCORE - 1);
        passportDecoder.setScore(other, MIN_PASSPORT_SCORE); // Eligible but not staked
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        _assertNobodyDrawn();
    }

    function test_draw_passportGate_decoderBurnsAllGas() public {
        passportDecoder.setScore(staker1, MIN_PASSPORT_SCORE);
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        passportDecoder.setMode(PassportDecoderMock.Mode.BurnAllGas);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        _assertNobodyDrawn();
    }

    function test_draw_passportGate_decoderShortReturnData() public {
        passportDecoder.setScore(staker1, MIN_PASSPORT_SCORE);
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        passportDecoder.setMode(PassportDecoderMock.Mode.ShortReturnData);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        _assertNobodyDrawn();
    }

    function test_draw_passportGate_decoderWithoutCode() public {
        passportDecoder.setScore(staker1, MIN_PASSPORT_SCORE);
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        vm.etch(address(passportDecoder), ""); // e.g. a broken upgrade of the decoder
        _assertNobodyDrawn();
    }

    /// @dev Both stakers ineligible in PARENT_COURT: the draw does not revert, nobody is drawn.
    function _assertNobodyDrawn() internal {
        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE);
        _stake(staker2, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 10);

        assertEq(_nbVoters(disputeID, 0), 0, "No vote should be drawn");
        assertEq(core.getRoundInfo(disputeID, 0).drawIterations, 10, "Wrong drawIterations");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Dispute should still be without jurors");
    }

    /// @dev A caller must not be able to skip an eligible juror by providing too little gas to the decoder call:
    /// for any gas amount, the draw either reverts or draws the eligible juror.
    function test_draw_passportGate_notEnoughGasNeverSkipsEligibleJuror() public {
        uint256 disputeID = _setupEligibleStaker1();
        for (uint256 gasLimit = 30_000; gasLimit <= 400_000; gasLimit += 1_000) {
            uint256 snapshot = vm.snapshot();
            (bool success, ) = address(core).call{gas: gasLimit}(abi.encodeCall(KlerosCoreBase.draw, (disputeID, 1)));
            if (success) assertEq(_nbVoters(disputeID, 0), 1, "Eligible juror skipped");
            vm.revertTo(snapshot);
        }
    }

    /// @dev Without enough gas to give the decoder the full PASSPORT_GAS_LIMIT, the draw reverts instead of rejecting
    /// the juror. A decoder burning all the gas forwarded makes it observable: the juror rejection that follows is cheap.
    function test_draw_passportGate_notEnoughGasReverts() public {
        uint256 disputeID = _setupEligibleStaker1();
        passportDecoder.setMode(PassportDecoderMock.Mode.BurnAllGas);

        bool guardTriggered;
        for (uint256 gasLimit = 30_000; gasLimit <= 400_000; gasLimit += 1_000) {
            uint256 snapshot = vm.snapshot();
            (bool success, bytes memory result) = address(core).call{gas: gasLimit}(
                abi.encodeCall(KlerosCoreBase.draw, (disputeID, 1))
            );
            if (success) {
                assertEq(_nbVoters(disputeID, 0), 0, "Nobody should be drawn");
                assertGe(
                    gasLimit,
                    (gatedDK.PASSPORT_GAS_LIMIT() * 64) / 63 + gatedDK.PASSPORT_CALL_OVERHEAD(),
                    "Rejected with too little gas"
                );
            } else if (
                result.length >= 4 && bytes4(result) == DisputeKitGatedPerCourt.NotEnoughGasForPassportCheck.selector
            ) {
                guardTriggered = true;
            }
            vm.revertTo(snapshot);
        }
        assertTrue(guardTriggered, "The gas guard should have triggered");
    }

    /// @dev Same as test_draw_passportGate_notEnoughGasNeverSkipsEligibleJuror with a decoder shaped like the real one
    /// (proxy -> implementation -> resolver proxy -> resolver implementation) and heavier than it, e.g. after an
    /// upgrade: when the call runs out of gas in the deepest frame, the outer frames of the decoder return the 1/64
    /// of the gas they kept, so the gas left after the call cannot tell a starved call from a failing one.
    /// Isolated: each draw below is a transaction of its own, with cold accesses like a real draw.
    /// forge-config: default.isolate = true
    function test_draw_passportGate_notEnoughGasNeverSkipsEligibleJuror_nestedDecoder() public {
        uint256 disputeID = _setupEligibleStaker1();
        PassportResolverMock resolver = _setNestedPassportDecoder(NESTED_DECODER_WORK_ITERATIONS);
        resolver.setScore(staker1, MIN_PASSPORT_SCORE);

        // Not the first draw: the drawIterations SSTORE from zero would need more gas than a skipped juror leaves.
        core.draw(disputeID, 1);
        assertEq(_nbVoters(disputeID, 0), 1, "Eligible juror should be drawn");

        uint256 drawn;
        for (uint256 gasLimit = 30_000; gasLimit <= 300_000; gasLimit += 50) {
            uint256 snapshot = vm.snapshot();
            (bool success, ) = address(core).call{gas: gasLimit}(abi.encodeCall(KlerosCoreBase.draw, (disputeID, 1)));
            if (success) {
                assertEq(_nbVoters(disputeID, 0), 2, "Eligible juror skipped");
                drawn++;
            }
            vm.revertTo(snapshot);
        }
        assertGt(drawn, 0, "The eligible juror should be drawn with enough gas");
    }

    /// @dev Whenever the draw goes through, the decoder received the full PASSPORT_GAS_LIMIT: the decoder returns the
    /// gas it received as the score, and the minimum score is what it returns with the full limit.
    /// Isolated: each draw below is a transaction of its own, where the cold access to the decoder costs the most.
    /// forge-config: default.isolate = true
    function test_draw_passportGate_decoderAlwaysGetsFullGasLimit() public {
        uint256 disputeID = _setupEligibleStaker1();
        passportDecoder.setMode(PassportDecoderMock.Mode.GasLeft);
        (, bytes memory result) = address(passportDecoder).staticcall{gas: gatedDK.PASSPORT_GAS_LIMIT()}(
            abi.encodeCall(IPassportDecoder.getScore, (staker1))
        );
        _setMinPassportScore(PARENT_COURT, abi.decode(result, (uint256)));

        // Not the first draw: less gas needed after the decoder call, the closest to the gas check a draw can succeed.
        core.draw(disputeID, 1);
        assertEq(_nbVoters(disputeID, 0), 1, "Eligible juror should be drawn");

        // Coarse search of the lowest gas limit letting the draw through, then gas limits around it one by one:
        // a decoder receiving slightly less than the limit would only happen right above the gas check.
        uint256 firstSuccess;
        for (uint256 gasLimit = 30_000; gasLimit <= 400_000 && firstSuccess == 0; gasLimit += 1_000) {
            if (_drawOnceWithGas(disputeID, gasLimit)) firstSuccess = gasLimit;
        }
        assertGt(firstSuccess, 0, "The eligible juror should be drawn with enough gas");
        for (uint256 gasLimit = firstSuccess - 1_000; gasLimit <= firstSuccess + 1_000; gasLimit++) {
            _drawOnceWithGas(disputeID, gasLimit);
        }
    }

    /// @dev Draws once with `_gasLimit` and reverts the state. If the draw goes through, the juror must be drawn again.
    /// @return success Whether the draw went through.
    function _drawOnceWithGas(uint256 _disputeID, uint256 _gasLimit) internal returns (bool success) {
        uint256 snapshot = vm.snapshot();
        (success, ) = address(core).call{gas: _gasLimit}(abi.encodeCall(KlerosCoreBase.draw, (_disputeID, 1)));
        if (success) assertEq(_nbVoters(_disputeID, 0), 2, "Decoder received less than PASSPORT_GAS_LIMIT");
        vm.revertTo(snapshot);
    }

    /// @dev Deploys a decoder shaped like the real one on Arbitrum One and sets it in the dispute kit.
    /// @param _workIterations The work done by the deepest frame, see PassportResolverMock.
    /// @return resolver The resolver holding the scores.
    function _setNestedPassportDecoder(uint256 _workIterations) internal returns (PassportResolverMock resolver) {
        resolver = PassportResolverMock(address(new DelegateProxyMock(address(new PassportResolverMock()))));
        resolver.setWorkIterations(_workIterations);
        IPassportDecoder decoder = IPassportDecoder(
            address(new DelegateProxyMock(address(new PassportDecoderImplMock(resolver))))
        );
        vm.prank(governor);
        gatedDK.changePassportDecoder(decoder);
    }

    function _setupEligibleStaker1() internal returns (uint256 disputeID) {
        passportDecoder.setScore(staker1, MIN_PASSPORT_SCORE);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE);
        disputeID = _createDispute();
    }

    function test_draw_tokenAndPassportGates() public {
        address staker3 = vm.addr(10);
        pinakion.transfer(staker3, 1 ether);
        vm.prank(staker3);
        pinakion.approve(address(core), 1 ether);

        // staker1: token only, staker2: passport only, staker3: both.
        gateERC20.transfer(staker1, 1);
        gateERC20.transfer(staker3, 1);
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        passportDecoder.setScore(staker3, MIN_PASSPORT_SCORE);
        _setGate(PARENT_COURT, address(gateERC20), false, 0);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);

        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE);
        _stake(staker2, PARENT_COURT, STAKE);
        _stake(staker3, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 100);

        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "All votes should be drawn");
        _assertAllVotersAre(disputeID, 0, staker3);
        assertGt(core.getRoundInfo(disputeID, 0).drawIterations, DEFAULT_NB_OF_JURORS, "Others never drawn?");
    }

    function test_draw_passportGateLiftedUnblocksDrawing() public {
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        arbitrable.changeArbitratorExtraData(_extraData(PARENT_COURT));
        _stake(staker1, PARENT_COURT, STAKE); // No attestation

        uint256 disputeID = _createDispute();
        core.draw(disputeID, 10);
        assertEq(_nbVoters(disputeID, 0), 0, "Gated: no vote should be drawn");

        // Governance lifts the gate: applies to the remaining draws.
        _setMinPassportScore(PARENT_COURT, 0);
        core.draw(disputeID, 10);
        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "Ungated: all votes should be drawn");
        _assertAllVotersAre(disputeID, 0, staker1);
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Dispute should be fully drawn");
    }

    // ************************************* //
    // *           Court jump              * //
    // ************************************* //

    /// @dev Child gated with ERC20 (held by staker1 only) -> parent gated with ERC721 (held by staker2 only).
    function test_courtJump_differentGatesChildAndParent() public {
        gateERC20.transfer(staker1, 1);
        gateERC721.safeMint(staker2);
        _setGate(CHILD_COURT, address(gateERC20), false, 0);
        _setGate(PARENT_COURT, address(gateERC721), false, 0);
        _stake(staker1, CHILD_COURT, STAKE);
        _stake(staker2, CHILD_COURT, STAKE);

        uint256 disputeID = _createDispute();

        // Round 0 in the child court: only the ERC20 holder.
        core.draw(disputeID, 100);
        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "Round 0 should be fully drawn");
        _assertAllVotersAre(disputeID, 0, staker1);

        _assertAppealJumpsCourtOnly(disputeID);

        // Round 1 in the parent court: only the ERC721 holder.
        core.draw(disputeID, 200);
        assertEq(_nbVoters(disputeID, 1), 7, "Round 1 should be fully drawn");
        _assertAllVotersAre(disputeID, 1, staker2);
    }

    /// @dev Child ungated -> parent gated (ERC721 held by staker2 only), dispute stays in this DK.
    /// staker1 staked in the child court (drawable in both), staker2 in the parent court only (not drawable in child).
    function test_courtJump_ungatedChildToGatedParent() public {
        gateERC721.safeMint(staker2);
        _setGate(PARENT_COURT, address(gateERC721), false, 0);
        _stake(staker1, CHILD_COURT, STAKE);
        _stake(staker2, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, CHILD_COURT, "Wrong initial court");

        // Round 0 in the ungated child court: the non-holder staker1 is drawn.
        core.draw(disputeID, 20);
        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "Round 0 should be fully drawn");
        _assertAllVotersAre(disputeID, 0, staker1);

        _assertAppealJumpsCourtOnly(disputeID);

        // Round 1 in the gated parent court: only the holder staker2 is drawn.
        core.draw(disputeID, 200);
        assertEq(_nbVoters(disputeID, 1), 7, "Round 1 should be fully drawn");
        _assertAllVotersAre(disputeID, 1, staker2);
        assertGt(core.getRoundInfo(disputeID, 1).drawIterations, 7, "staker1 never drawn in parent?");
    }

    /// @dev Child gated (ERC721 held by staker2 only) -> parent ungated, dispute stays in this DK.
    function test_courtJump_gatedChildToUngatedParent() public {
        gateERC721.safeMint(staker2);
        _setGate(CHILD_COURT, address(gateERC721), false, 0);
        _stake(staker1, CHILD_COURT, STAKE);
        _stake(staker2, CHILD_COURT, STAKE);

        uint256 disputeID = _createDispute();

        // Round 0 in the gated child court: only the holder staker2.
        core.draw(disputeID, 100);
        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "Round 0 should be fully drawn");
        _assertAllVotersAre(disputeID, 0, staker2);

        _assertAppealJumpsCourtOnly(disputeID);

        // Round 1 in the ungated parent court: the non-holder staker1 becomes drawable.
        core.draw(disputeID, 7);
        assertEq(_nbVoters(disputeID, 1), 7, "Round 1 should be drawn without rejection");
        assertEq(core.getRoundInfo(disputeID, 1).drawIterations, 7, "No draw should be rejected");
        assertGt(_countVotesOf(disputeID, 1, staker1), 0, "Non-holder should be drawn after the jump");
    }

    /// @dev The Commerce setup: child ungated -> parent gated by Human Passport score, dispute stays in this DK.
    /// staker1 staked in the child court without attestation, staker2 in the parent court only with a passing score.
    function test_courtJump_ungatedChildToPassportGatedParent() public {
        passportDecoder.setScore(staker2, MIN_PASSPORT_SCORE);
        _setMinPassportScore(PARENT_COURT, MIN_PASSPORT_SCORE);
        _stake(staker1, CHILD_COURT, STAKE);
        _stake(staker2, PARENT_COURT, STAKE);

        uint256 disputeID = _createDispute();

        // Round 0 in the ungated child court: staker1 without attestation is drawn.
        core.draw(disputeID, 20);
        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "Round 0 should be fully drawn");
        _assertAllVotersAre(disputeID, 0, staker1);

        _assertAppealJumpsCourtOnly(disputeID);

        // Round 1 in the gated parent court: only staker2 with a passing score is drawn.
        core.draw(disputeID, 200);
        assertEq(_nbVoters(disputeID, 1), 7, "Round 1 should be fully drawn");
        _assertAllVotersAre(disputeID, 1, staker2);
        assertGt(core.getRoundInfo(disputeID, 1).drawIterations, 7, "staker1 never drawn in parent?");
    }

    /// @dev Round 0 voted and appealed: the court jumps CHILD -> PARENT but the DK stays the same.
    function _assertAppealJumpsCourtOnly(uint256 _disputeID) internal {
        _voteAndPassToAppeal(_disputeID);
        assertEq(core.isDisputeKitJumping(_disputeID), false, "DK should not be jumping");
        _fundLoser(_disputeID);

        vm.recordLogs();
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.CourtJump(_disputeID, 1, CHILD_COURT, PARENT_COURT);
        _fundWinnerAndAppeal(_disputeID);

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 dkJumpTopic = KlerosCoreBase.DisputeKitJump.selector;
        bytes32 dkCreationTopic = DisputeKitClassicBase.DisputeCreation.selector;
        bool courtJumped;
        for (uint256 i = 0; i < logs.length; i++) {
            assertTrue(logs[i].topics[0] != dkJumpTopic, "DisputeKitJump should not be emitted");
            assertTrue(logs[i].topics[0] != dkCreationTopic, "No dispute should be created in a DK");
            if (logs[i].topics[0] == KlerosCoreBase.CourtJump.selector) courtJumped = true;
        }
        assertTrue(courtJumped, "CourtJump should be emitted");

        (uint96 courtID, , KlerosCoreBase.Period period, , ) = core.disputes(_disputeID);
        assertEq(courtID, PARENT_COURT, "Dispute should be in the parent court");
        assertEq(uint256(period), uint256(KlerosCoreBase.Period.evidence), "Wrong period");

        KlerosCoreBase.Round memory round = core.getRoundInfo(_disputeID, 1);
        assertEq(round.disputeKitID, GATED_DK_ID, "Dispute should stay in this DK");
        assertEq(round.nbVotes, 7, "Wrong nbVotes");

        (, bool jumped, ) = gatedDK.disputes(0);
        assertEq(jumped, false, "Local dispute should not be jumped");
        assertEq(gatedDK.getNumberOfRounds(0), 2, "A new local round should be created");
    }

    /// @dev Config requirement: if the parent court does not support this DK, the dispute leaves it for the classic DK.
    function test_courtJump_parentNotSupportingDK_fallsBackToClassic() public {
        uint256[] memory dks = new uint256[](1);
        dks[0] = GATED_DK_ID;
        vm.prank(governor);
        core.enableDisputeKits(PARENT_COURT, dks, false);

        _stake(staker1, CHILD_COURT, STAKE);
        uint256 disputeID = _createDispute();
        core.draw(disputeID, 20);
        assertEq(_nbVoters(disputeID, 0), DEFAULT_NB_OF_JURORS, "Round 0 should be fully drawn");

        _voteAndPassToAppeal(disputeID);
        assertEq(core.isDisputeKitJumping(disputeID), true, "DK should be jumping");
        _fundLoser(disputeID);

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.CourtJump(disputeID, 1, CHILD_COURT, PARENT_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.DisputeKitJump(disputeID, 1, GATED_DK_ID, DISPUTE_KIT_CLASSIC);
        _fundWinnerAndAppeal(disputeID);

        assertEq(core.getRoundInfo(disputeID, 1).disputeKitID, DISPUTE_KIT_CLASSIC, "Should fall back to classic");
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, PARENT_COURT, "Dispute should be in the parent court");
        (, bool jumped, ) = gatedDK.disputes(0);
        assertEq(jumped, true, "Local dispute should be jumped");

        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToParentDK.selector);
        gatedDK.draw(disputeID, 1);
    }
}
