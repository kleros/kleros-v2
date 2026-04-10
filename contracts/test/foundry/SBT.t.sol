// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {SBT} from "../../src/token/SBT.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";

contract SBT_Test is Test {
    SBT sbt;
    address owner;
    address alice;
    address bob;

    event MetadataUpdate(uint256 _tokenId);
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);

    function setUp() public {
        owner = address(this);
        alice = vm.addr(1);
        bob = vm.addr(2);
        sbt = new SBT("Test SBT", "TSBT", "A test token", "ipfs://image", "https://example.com");
    }

    // ============================== //
    //     Constructor & Metadata     //
    // ============================== //

    function test_constructor() public view {
        assertEq(sbt.name(), "Test SBT");
        assertEq(sbt.symbol(), "TSBT");
        assertEq(sbt.description(), "A test token");
        assertEq(sbt.imageUri(), "ipfs://image");
        assertEq(sbt.externalUrl(), "https://example.com");
        assertEq(sbt.owner(), owner);
    }

    function test_tokenURI() public {
        sbt.safeMint(alice);
        string memory uri = sbt.tokenURI(0);
        // Should start with the base64 data URI prefix
        assertGt(bytes(uri).length, 29);
        // Verify it starts with "data:application/json;base64,"
        bytes memory prefix = bytes("data:application/json;base64,");
        for (uint256 i = 0; i < prefix.length; i++) {
            assertEq(bytes(uri)[i], prefix[i]);
        }
    }

    function test_tokenURI_nonexistent() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 999));
        sbt.tokenURI(999);
    }

    function test_supportsInterface() public view {
        // ERC165
        assertTrue(sbt.supportsInterface(type(IERC165).interfaceId));
        // ERC721
        assertTrue(sbt.supportsInterface(type(IERC721).interfaceId));
        // ERC4906
        assertTrue(sbt.supportsInterface(bytes4(0x49064906)));
    }

    // ============================== //
    //           Minting              //
    // ============================== //

    function test_safeMint() public {
        uint256 tokenId = sbt.safeMint(alice);
        assertEq(tokenId, 0);
        assertEq(sbt.balanceOf(alice), 1);
        assertEq(sbt.ownerOf(0), alice);
    }

    function test_safeMint_incrementsTokenId() public {
        uint256 first = sbt.safeMint(alice);
        uint256 second = sbt.safeMint(bob);
        assertEq(first, 0);
        assertEq(second, 1);
    }

    function test_safeMint_emitsMetadataUpdate() public {
        vm.expectEmit(false, false, false, true);
        emit MetadataUpdate(0);
        sbt.safeMint(alice);
    }

    function test_safeMint_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        sbt.safeMint(bob);
    }

    function test_safeMint_duplicateAddress() public {
        sbt.safeMint(alice);
        vm.expectRevert(abi.encodeWithSelector(SBT.AddressAlreadyHasToken.selector));
        sbt.safeMint(alice);
    }

    // ============================== //
    //      Transfers (blocked)       //
    // ============================== //

    function test_transferFrom_reverts() public {
        sbt.safeMint(alice);
        vm.prank(alice);
        vm.expectRevert(SBT.TransfersNotPermitted.selector);
        sbt.transferFrom(alice, bob, 0);
    }

    function test_safeTransferFrom_reverts() public {
        sbt.safeMint(alice);
        vm.prank(alice);
        vm.expectRevert(SBT.TransfersNotPermitted.selector);
        sbt.safeTransferFrom(alice, bob, 0);
    }

    // ============================== //
    //           Burning              //
    // ============================== //

    function test_burn_byTokenHolder() public {
        sbt.safeMint(alice);
        assertEq(sbt.balanceOf(alice), 1);
        vm.prank(alice);
        sbt.burn(0);
        assertEq(sbt.balanceOf(alice), 0);
    }

    function test_burn_byContractOwner() public {
        sbt.safeMint(alice);
        assertEq(sbt.balanceOf(alice), 1);
        // Owner (address(this)) burns alice's token — enabled by _isAuthorized override
        sbt.burn(0);
        assertEq(sbt.balanceOf(alice), 0);
    }

    function test_burn_byNonOwner_reverts() public {
        sbt.safeMint(alice);
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InsufficientApproval.selector, bob, 0));
        sbt.burn(0);
    }

    function test_burn_nonexistent_reverts() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 999));
        sbt.burn(999);
    }

    function test_burn_thenRemint() public {
        sbt.safeMint(alice);
        vm.prank(alice);
        sbt.burn(0);
        assertEq(sbt.balanceOf(alice), 0);
        // Can mint again after burn
        uint256 newTokenId = sbt.safeMint(alice);
        assertEq(sbt.balanceOf(alice), 1);
        assertEq(newTokenId, 1); // tokenId counter does not reset
    }

    // ============================== //
    //           Pausable             //
    // ============================== //

    function test_pause() public {
        sbt.pause();
        vm.expectRevert(Pausable.EnforcedPause.selector);
        sbt.safeMint(alice);
    }

    function test_unpause() public {
        sbt.pause();
        sbt.unpause();
        sbt.safeMint(alice);
        assertEq(sbt.balanceOf(alice), 1);
    }

    function test_pause_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        sbt.pause();
    }

    function test_burn_whenPaused() public {
        sbt.safeMint(alice);
        sbt.pause();
        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        sbt.burn(0);
    }

    // ============================== //
    //      Governance (metadata)     //
    // ============================== //

    function test_changeName() public {
        sbt.changeName("New Name");
        assertEq(sbt.name(), "New Name");
    }

    function test_changeDescription() public {
        sbt.changeDescription("New desc");
        assertEq(sbt.description(), "New desc");
    }

    function test_changeImageUri() public {
        sbt.changeImageUri("ipfs://new");
        assertEq(sbt.imageUri(), "ipfs://new");
    }

    function test_changeExternalUrl() public {
        sbt.changeExternalUrl("https://new.com");
        assertEq(sbt.externalUrl(), "https://new.com");
    }

    function test_batchMetadataUpdate() public {
        vm.expectEmit(false, false, false, true);
        emit BatchMetadataUpdate(0, 10);
        sbt.batchMetadataUpdate(0, 10);
    }

    function test_changeName_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        sbt.changeName("Nope");
    }
}
