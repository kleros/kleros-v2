// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ForkToken} from "../../src/token/ForkToken.sol";

/// @title ForkToken_Test
/// @notice Unit tests for the minority-fork ERC-20. `ForkToken` is fully implemented (no spec ambiguity),
///         so this suite is GREEN from the start and acts as a TDD sanity anchor.
contract ForkToken_Test is Test {
    ForkToken token;
    address settlement; // The owner / mint authority.
    address alice;
    address bob;

    function setUp() public {
        settlement = vm.addr(100);
        alice = vm.addr(101);
        bob = vm.addr(102);
        token = new ForkToken("Kleros Fork Token 2", "PNK2", settlement);
    }

    function test_metadata() public view {
        assertEq(token.name(), "Kleros Fork Token 2");
        assertEq(token.symbol(), "PNK2");
        assertEq(token.owner(), settlement);
        assertEq(token.totalSupply(), 0);
    }

    function test_mint_onlyOwnerCanMint() public {
        vm.prank(settlement);
        token.mint(alice, 1000);
        assertEq(token.balanceOf(alice), 1000);
        assertEq(token.totalSupply(), 1000);
    }

    function test_mint_revertsForNonOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1000);
    }

    function test_mint_tracksSupplyAcrossHolders() public {
        vm.startPrank(settlement);
        token.mint(alice, 700);
        token.mint(bob, 300);
        vm.stopPrank();
        assertEq(token.totalSupply(), 1000, "supply must equal the sum of genesis balances");
    }

    function test_allowanceParity_increaseDecrease() public {
        vm.prank(alice);
        token.increaseAllowance(bob, 500);
        assertEq(token.allowance(alice, bob), 500);

        vm.prank(alice);
        token.decreaseAllowance(bob, 200);
        assertEq(token.allowance(alice, bob), 300);
    }

    function test_decreaseAllowance_revertsBelowZero() public {
        vm.prank(alice);
        vm.expectRevert(bytes("ERC20: decreased allowance below zero"));
        token.decreaseAllowance(bob, 1);
    }
}
