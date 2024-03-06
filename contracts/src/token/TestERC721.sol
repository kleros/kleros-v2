// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
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
}
