// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract TestERC721 is ERC721, ERC721Enumerable {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner;
    uint256 private _nextTokenId;

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier ownerOnly() {
        require(msg.sender == owner, "Owner only");
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeOwner(address _newOwner) external ownerOnly {
        owner = _newOwner;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function safeMint(address to) external ownerOnly {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function _increaseBalance(address account, uint128 value) internal virtual override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
        super._update(to, tokenId, auth);
    }
}
