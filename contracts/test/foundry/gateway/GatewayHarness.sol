// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, Vm} from "forge-std/Test.sol";
import {ForeignGateway} from "../../../src/gateway/ForeignGateway.sol";
import {HomeGateway} from "../../../src/gateway/HomeGateway.sol";
import {IForeignGateway} from "../../../src/gateway/interfaces/IForeignGateway.sol";
import {KlerosCoreRuler} from "../../../src/arbitration/devtools/KlerosCoreRuler.sol";
import {IArbitratorV2, IArbitrableV2} from "../../../src/arbitration/interfaces/IArbitratorV2.sol";
import {UUPSProxy} from "../../../src/proxy/UUPSProxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Yaho} from "@kleros/veashi-sdk/contracts/Yaho.sol";
import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IJushin} from "@kleros/veashi-sdk/contracts/interfaces/IJushin.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {VouchingReporter} from "./Reporters.sol";
import "../../../src/libraries/Constants.sol";

/// @dev Both gateways wired to each other in one EVM, as on two chains: a real SDK Yaho per leg, vouching reporters
/// whose dispatcher is the sending gateway, plain-address adapters, and KlerosCoreRuler (manual ruling) as the
/// HomeGateway's arbitrator. Yaru is a pranked address: `_deliver` does what Yaru does once the adapters agree.
/// Every chain ID is `block.chainid`, so both gateways compute the same dispute hash.
/// This contract is the arbitrable of the foreign disputes and the ruler of the HomeGateway's disputes.
abstract contract GatewayHarness is Test {
    uint256 internal constant NB_ORACLES = 2;
    uint256 internal constant CHOICES = 2;
    uint96 internal constant MIRRORED_COURT = 2; // Exists on the ruler, mirrored on the ForeignGateway.
    uint96 internal constant UNMIRRORED_COURT = 3; // Exists on the ruler, not mirrored.
    uint256 internal constant GENERAL_FEE = 0.01 ether;
    uint256 internal constant MIRRORED_COURT_FEE = 0.02 ether;
    uint256 internal constant UNMIRRORED_COURT_FEE = 0.03 ether;
    uint256 internal constant EXTERNAL_DISPUTE_ID = 77;
    uint256 internal constant TEMPLATE_ID = 5;
    string internal constant TEMPLATE_URI = "/ipfs/template";

    address internal governor = makeAddr("governor");
    address internal keeper = makeAddr("keeper");
    address internal other = makeAddr("other");
    address internal foreignYaru = makeAddr("foreignYaru"); // Delivers rulings to the ForeignGateway.
    address internal homeYaru = makeAddr("homeYaru"); // Delivers disputes to the HomeGateway.

    Yaho internal foreignYaho; // Dispute leg.
    Yaho internal homeYaho; // Ruling leg.
    VouchingReporter[] internal foreignReporters; // Dispute leg, dispatcher: the ForeignGateway.
    VouchingReporter[] internal homeReporters; // Ruling leg, dispatcher: the HomeGateway.
    IAdapter[] internal homeAdapters; // Dispute leg, on the home chain.
    IAdapter[] internal foreignAdapters; // Ruling leg, on the foreign chain.

    KlerosCoreRuler internal ruler;
    ForeignGateway internal foreignGateway;
    HomeGateway internal homeGateway;

    // Rulings received as the arbitrable of the foreign disputes.
    uint256 internal rulingCount;
    uint256 internal lastRuledDisputeID;
    uint256 internal lastRuling;

    // Creation failures received as the arbitrable of the foreign disputes.
    uint256 internal creationFailureCount;
    uint256 internal lastFailedDisputeID;
    bool internal rejectCreationFailure; // Makes `onDisputeCreationFailed` revert.

    function setUp() public virtual {
        foreignYaho = new Yaho();
        homeYaho = new Yaho();

        KlerosCoreRuler rulerLogic = new KlerosCoreRuler();
        bytes memory rulerInit = abi.encodeCall(
            KlerosCoreRuler.initialize,
            (governor, IERC20(makeAddr("pinakion")), [uint256(0), 0, GENERAL_FEE, 0])
        );
        ruler = KlerosCoreRuler(address(new UUPSProxy(address(rulerLogic), rulerInit)));
        vm.startPrank(governor);
        ruler.createCourt(GENERAL_COURT, false, 0, 0, MIRRORED_COURT_FEE, 0, [uint256(0), 0, 0, 0]);
        ruler.createCourt(GENERAL_COURT, false, 0, 0, UNMIRRORED_COURT_FEE, 0, [uint256(0), 0, 0, 0]);
        vm.stopPrank();

        ForeignGateway.Oracle[] memory foreignOracles = new ForeignGateway.Oracle[](NB_ORACLES);
        HomeGateway.Oracle[] memory homeOracles = new HomeGateway.Oracle[](NB_ORACLES);
        for (uint256 i = 0; i < NB_ORACLES; i++) {
            foreignReporters.push(new VouchingReporter(address(foreignYaho)));
            homeReporters.push(new VouchingReporter(address(homeYaho)));
            homeAdapters.push(IAdapter(makeAddr(string.concat("homeAdapter", vm.toString(i)))));
            foreignAdapters.push(IAdapter(makeAddr(string.concat("foreignAdapter", vm.toString(i)))));
            foreignOracles[i] = ForeignGateway.Oracle({
                outboundReporter: foreignReporters[i],
                outboundAdapter: homeAdapters[i],
                inboundAdapter: foreignAdapters[i],
                enabled: true
            });
            homeOracles[i] = HomeGateway.Oracle({
                outboundReporter: homeReporters[i],
                outboundAdapter: foreignAdapters[i],
                inboundAdapter: homeAdapters[i]
            });
        }

        bytes memory homeInit = abi.encodeCall(
            HomeGateway.initialize,
            (
                governor,
                IArbitratorV2(address(ruler)),
                block.chainid,
                address(0), // Set below, once the ForeignGateway exists.
                IYaho(address(homeYaho)),
                homeYaru,
                homeOracles
            )
        );
        homeGateway = HomeGateway(payable(address(new UUPSProxy(address(new HomeGateway()), homeInit))));

        bytes memory foreignInit = abi.encodeCall(
            ForeignGateway.initialize,
            (
                governor,
                keeper,
                block.chainid,
                address(homeGateway),
                IYaho(address(foreignYaho)),
                foreignYaru,
                1e18,
                foreignOracles,
                _ids(0),
                1
            )
        );
        foreignGateway = ForeignGateway(address(new UUPSProxy(address(new ForeignGateway()), foreignInit)));

        for (uint256 i = 0; i < NB_ORACLES; i++) {
            foreignReporters[i].setDispatcher(address(foreignGateway));
            homeReporters[i].setDispatcher(address(homeGateway));
        }

        vm.startPrank(governor);
        homeGateway.changeForeignGateway(address(foreignGateway));
        foreignGateway.changeCourtJurorFee(GENERAL_COURT, GENERAL_FEE);
        foreignGateway.changeCourtJurorFee(MIRRORED_COURT, MIRRORED_COURT_FEE);
        vm.stopPrank();

        ruler.changeRulingModeToManual(IArbitrableV2(address(homeGateway)));
        vm.deal(address(homeGateway), 100 ether);
        vm.deal(address(this), 100 ether);
    }

    /// @dev The arbitrable's side of the foreign disputes.
    function rule(uint256 _disputeID, uint256 _ruling) external {
        require(msg.sender == address(foreignGateway), "Only the ForeignGateway");
        rulingCount++;
        lastRuledDisputeID = _disputeID;
        lastRuling = _ruling;
    }

    /// @dev The arbitrable's side of a foreign dispute the home chain could not create.
    function onDisputeCreationFailed(uint256 _disputeID) external {
        require(msg.sender == address(foreignGateway), "Only the ForeignGateway");
        require(!rejectCreationFailure, "Creation failure rejected");
        creationFailureCount++;
        lastFailedDisputeID = _disputeID;
    }

    // ************************************* //
    // *         Dispute helpers           * //
    // ************************************* //

    /// @dev Creates a native-fee dispute on the ForeignGateway with explicit oracles, paying exactly its cost.
    function _createDispute(
        bytes memory _extraData,
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal returns (uint256 disputeID) {
        uint256 cost = foreignGateway.arbitrationCost(_extraData, _oracleIDs);
        disputeID = foreignGateway.createDispute{value: cost}(CHOICES, _extraData, _oracleIDs, _threshold);
    }

    /// @dev Relays a dispute this contract created and returns the message Yaho dispatched.
    function _relay(
        uint256 _disputeID,
        bytes memory _extraData
    ) internal returns (uint256 messageId, Message memory message) {
        vm.recordLogs();
        uint256 returnedId = foreignGateway.relayDispute(
            _disputeID,
            CHOICES,
            _extraData,
            EXTERNAL_DISPUTE_ID,
            TEMPLATE_ID,
            TEMPLATE_URI
        );
        (messageId, message) = _dispatchedMessage(foreignYaho);
        assertEq(returnedId, messageId, "relayDispute returns the Yaho message ID");
    }

    /// @dev Creates, relays and delivers a dispute to the HomeGateway, which creates it on the ruler.
    function _disputeOnHome(
        bytes memory _extraData,
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal returns (uint256 foreignDisputeID, uint256 homeDisputeID, bytes32 disputeHash) {
        foreignDisputeID = _createDispute(_extraData, _oracleIDs, _threshold);
        (uint256 messageId, Message memory message) = _relay(foreignDisputeID, _extraData);
        homeDisputeID = ruler.getNextDisputeID();
        _deliver(homeYaru, foreignYaho, messageId, message);
        disputeHash = _disputeHash(foreignDisputeID, _extraData);
        assertEq(homeGateway.disputeHashToHomeID(disputeHash), homeDisputeID, "home dispute ID");
    }

    /// @dev Makes the ruler reject the HomeGateway's disputes: in automatic mode it rules them at creation, and `rule`
    /// reverts since the HomeGateway has not stored the dispute yet.
    function _breakRuler() internal {
        ruler.changeRulingModeToAutomaticPreset(IArbitrableV2(address(homeGateway)), 1, false, false);
    }

    /// @dev Creates and relays a dispute, and delivers it to the HomeGateway, whose arbitrator must reject it. Returns
    /// the creation failure Yaho dispatched.
    function _failOnHome(
        bytes memory _extraData,
        uint256[] memory _oracleIDs,
        uint256 _threshold
    ) internal returns (uint256 foreignDisputeID, bytes32 disputeHash, uint256 messageId, Message memory message) {
        foreignDisputeID = _createDispute(_extraData, _oracleIDs, _threshold);
        (uint256 disputeMessageId, Message memory disputeMessage) = _relay(foreignDisputeID, _extraData);
        disputeHash = _disputeHash(foreignDisputeID, _extraData);
        vm.recordLogs();
        _deliver(homeYaru, foreignYaho, disputeMessageId, disputeMessage);
        (messageId, message) = _dispatchedMessage(homeYaho);
    }

    /// @dev Rules a HomeGateway dispute on the ruler and returns the message Yaho dispatched.
    function _ruleOnHome(
        uint256 _homeDisputeID,
        uint256 _ruling
    ) internal returns (uint256 messageId, Message memory message) {
        vm.recordLogs();
        ruler.executeRuling(_homeDisputeID, _ruling, false, false);
        (messageId, message) = _dispatchedMessage(homeYaho);
    }

    // ************************************* //
    // *          Message helpers          * //
    // ************************************* //

    /// @dev The last message `_yaho` dispatched in the recorded logs.
    function _dispatchedMessage(Yaho _yaho) internal returns (uint256 messageId, Message memory message) {
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bool found;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].emitter == address(_yaho) && logs[i].topics[0] == IYaho.MessageDispatched.selector) {
                messageId = uint256(logs[i].topics[1]);
                message = abi.decode(logs[i].data, (Message));
                found = true;
            }
        }
        assertTrue(found, "no message dispatched");
    }

    /// @dev What Yaru does once the message's adapters reached its threshold: the message ID is recomputed from the
    /// source Yaho, and the receiver gets the message's own sender, threshold and adapters.
    function _deliver(address _yaru, Yaho _sourceYaho, uint256 _messageId, Message memory _message) internal {
        bytes32 messageHash = _sourceYaho.calculateMessageHash(_message);
        assertEq(
            _sourceYaho.calculateMessageId(block.chainid, address(_sourceYaho), messageHash),
            _messageId,
            "message ID"
        );
        assertEq(_message.targetChainId, block.chainid, "target chain");
        vm.prank(_yaru);
        IJushin(_message.receiver).onMessage(
            _messageId,
            block.chainid,
            _message.sender,
            _message.threshold,
            _message.adapters,
            _message.data
        );
    }

    /// @dev Asserts that `_reporter` was asked to dispatch `_message` (it reverts unless its dispatcher vouches).
    function _assertReported(
        VouchingReporter _reporter,
        Yaho _yaho,
        uint256 _messageId,
        Message memory _message
    ) internal view {
        assertEq(_reporter.lastMessageId(), _messageId, "reported message ID");
        assertEq(_reporter.lastMessageHash(), _yaho.calculateMessageHash(_message), "reported message hash");
        assertFalse(_reporter.otherHashVouched(), "vouched for another hash");
    }

    function _disputeHash(uint256 _foreignDisputeID, bytes memory _extraData) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "createDispute",
                    block.chainid,
                    address(foreignGateway),
                    address(this),
                    _foreignDisputeID,
                    CHOICES,
                    _extraData
                )
            );
    }

    // ************************************* //
    // *              Arrays               * //
    // ************************************* //

    function _ids(uint256 _a) internal pure returns (uint256[] memory ids) {
        ids = new uint256[](1);
        ids[0] = _a;
    }

    function _ids(uint256 _a, uint256 _b) internal pure returns (uint256[] memory ids) {
        ids = new uint256[](2);
        ids[0] = _a;
        ids[1] = _b;
    }

    function _reporters(IReporter _a, IReporter _b) internal pure returns (IReporter[] memory reporters) {
        reporters = new IReporter[](2);
        reporters[0] = _a;
        reporters[1] = _b;
    }

    function _adapters(IAdapter _a, IAdapter _b) internal pure returns (IAdapter[] memory adapters) {
        adapters = new IAdapter[](2);
        adapters[0] = _a;
        adapters[1] = _b;
    }
}
