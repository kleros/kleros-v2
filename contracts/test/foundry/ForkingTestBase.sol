// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitForking} from "../../src/arbitration/dispute-kits/DisputeKitForking.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {ForkSettlement} from "../../src/arbitration/dispute-kits/ForkSettlement.sol";
import {PNKHolderEscrow} from "../../src/arbitration/dispute-kits/PNKHolderEscrow.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import "../../src/libraries/Constants.sol";

/// @title ForkingTestBase
/// @notice Shared fixture for the forking-mechanism test suites. Extends `KlerosCore_TestBase` and adds
///         the forking dispute kit, settlement, and escrow, wiring the routing that makes a General Court
///         appeal exhaustion jump into the forking court and switch to `DisputeKitForking`.
/// @dev The routing requires BOTH (1) `enableDisputeKits(FORKING_COURT, [forkingDKID], true)` so the
///      forking court supports the forking DK, and (2) `changeNextRoundSettings(GENERAL_COURT, {...
///      jumpDisputeKitIDOnCourtJump: forkingDKID})` on the classic DK so the parent-court jump switches
///      the dispute kit. Without (2) the jump keeps Classic and Core's compatibility fallback corrupts
///      routing — see `docs/layer-1-core/07-forking.md` and the plan's "jump routing chain".
abstract contract ForkingTestBase is KlerosCore_TestBase {
    DisputeKitForking forkingDK;
    ForkSettlement forkSettlement;
    PNKHolderEscrow escrow;
    uint256 forkingDKID;

    function setUp() public virtual override {
        super.setUp();

        // Deploy the forking dispute kit behind a proxy.
        DisputeKitForking forkingLogic = new DisputeKitForking();
        bytes memory initData = abi.encodeWithSignature("initialize(address,address)", owner, address(core));
        UUPSProxy proxy = new UUPSProxy(address(forkingLogic), initData);
        forkingDK = DisputeKitForking(address(proxy));

        // Register and enable it on the forking court.
        vm.startPrank(owner);
        core.addNewDisputeKit(forkingDK);
        forkingDKID = core.getDisputeKitsLength() - 1;
        uint256[] memory dks = new uint256[](1);
        dks[0] = forkingDKID;
        core.enableDisputeKits(FORKING_COURT, dks, true);

        // Route the General Court's court jump to the forking dispute kit.
        DisputeKitClassic.NextRoundSettings memory settings = DisputeKitClassic.NextRoundSettings({
            enabled: true,
            jumpCourtID: 0, // undefined → default parent-jump logic targets FORKING_COURT
            jumpDisputeKitID: 0, // undefined → use jumpDisputeKitIDOnCourtJump below
            jumpDisputeKitIDOnCourtJump: forkingDKID,
            nbVotes: 0
        });
        disputeKit.changeNextRoundSettings(GENERAL_COURT, settings);
        vm.stopPrank();

        // Deploy settlement + escrow and wire them.
        forkSettlement = new ForkSettlement(owner, core, address(forkingDK));
        escrow = new PNKHolderEscrow(owner, core);

        vm.startPrank(owner);
        core.setForkSettlement(address(forkSettlement));
        forkingDK.changeComposedUnits(forkSettlement, escrow);
        escrow.setForkSettlement(address(forkSettlement));
        vm.stopPrank();
    }
}
