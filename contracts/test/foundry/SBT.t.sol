// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {SBT} from "../../src/token/SBT.sol";

contract SBT_Test is Test {
    SBT sbt;
    address owner;
    address alice;
    address bob;

    function setUp() public {
        owner = address(this);
        alice = vm.addr(1);
        bob = vm.addr(2);
        sbt = new SBT("Test SBT", "TSBT", "ipfs://metadata");
    }

    // ============================== //
    //     Constructor & Metadata     //
    // ============================== //

    function test_constructor() public view {
        assertEq(sbt.name(), "Test SBT");
        assertEq(sbt.symbol(), "TSBT");
        assertEq(sbt.metadataURI(), "ipfs://metadata");
        assertEq(sbt.owner(), owner);
        assertEq(sbt.nextTokenId(), 0);
    }

    // ============================== //
    //           Minting              //
    // ============================== //

    function test_mint() public {
        uint256 tokenId = sbt.mint(alice);

        assertEq(tokenId, 0);
        assertEq(sbt.balanceOf(alice), 1);
        assertEq(sbt.ownerOf(0), alice);
        assertEq(sbt.nextTokenId(), 1);
    }

    function test_mint_incrementsTokenId() public {
        uint256 first = sbt.mint(alice);
        uint256 second = sbt.mint(bob);

        assertEq(first, 0);
        assertEq(second, 1);
    }

    function test_mint_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(SBT.NotAuthorized.selector);
        sbt.mint(bob);
    }

    function test_mint_duplicateAddress() public {
        sbt.mint(alice);

        vm.expectRevert(SBT.AddressAlreadyHasToken.selector);
        sbt.mint(alice);
    }

    function test_mint_zeroAddress() public {
        vm.expectRevert(SBT.InvalidAddress.selector);
        sbt.mint(address(0));
    }

    // ============================== //
    //      Transfers (blocked)       //
    // ============================== //

    function test_transferFrom_reverts() public {
        sbt.mint(alice);

        vm.prank(alice);
        vm.expectRevert(SBT.TransfersNotPermitted.selector);
        sbt.transferFrom(alice, bob, 0);
    }

    function test_safeTransferFrom_reverts() public {
        sbt.mint(alice);

        vm.prank(alice);
        vm.expectRevert(SBT.TransfersNotPermitted.selector);
        sbt.safeTransferFrom(alice, bob, 0);
    }

    function test_safeTransferFromWithData_reverts() public {
        sbt.mint(alice);

        vm.prank(alice);
        vm.expectRevert(SBT.TransfersNotPermitted.selector);
        sbt.safeTransferFrom(alice, bob, 0, "");
    }

    // ============================== //
    //           Burning              //
    // ============================== //

    function test_burn_byTokenHolder() public {
        sbt.mint(alice);

        vm.prank(alice);
        sbt.burn(0);

        assertEq(sbt.balanceOf(alice), 0);
        assertEq(sbt.ownerOf(0), address(0));
    }

    function test_burn_byContractOwner() public {
        sbt.mint(alice);

        sbt.burn(0);

        assertEq(sbt.balanceOf(alice), 0);
        assertEq(sbt.ownerOf(0), address(0));
    }

    function test_burn_byNonOwner_reverts() public {
        sbt.mint(alice);

        vm.prank(bob);
        vm.expectRevert(SBT.NotAuthorized.selector);
        sbt.burn(0);
    }

    function test_burn_nonexistent_reverts() public {
        vm.expectRevert(SBT.TokenDoesNotExist.selector);
        sbt.burn(999);
    }

    function test_burn_thenRemint() public {
        sbt.mint(alice);

        vm.prank(alice);
        sbt.burn(0);

        uint256 newTokenId = sbt.mint(alice);

        assertEq(sbt.balanceOf(alice), 1);
        assertEq(sbt.ownerOf(newTokenId), alice);
        assertEq(newTokenId, 1); // Token ID counter does not reset.
    }

    // ============================== //
    //           Governance           //
    // ============================== //

    function test_changeOwner() public {
        sbt.changeOwner(alice);

        assertEq(sbt.owner(), alice);

        vm.prank(alice);
        sbt.mint(bob);

        assertEq(sbt.balanceOf(bob), 1);
    }

    function test_changeOwner_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(SBT.NotAuthorized.selector);
        sbt.changeOwner(bob);
    }
}
