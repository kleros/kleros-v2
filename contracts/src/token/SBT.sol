// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ERC721, IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SBT is ERC721, ERC721Pausable, ERC721Burnable, IERC4906, Ownable {
    // Interface ID as defined in ERC-4906. This does not correspond to a traditional interface ID as ERC-4906 only
    // defines events and does not include any external function.
    bytes4 private constant ERC4906_INTERFACE_ID = bytes4(0x49064906);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 private __nextTokenId;
    string private __name;
    string public description;
    string public imageUri;
    string public externalUrl;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    error TransfersNotPermitted();

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _imageUri,
        string memory _externalUrl
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        __name = _name;
        description = _description;
        imageUri = _imageUri;
        externalUrl = _externalUrl;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function changeName(string memory _name) public onlyOwner {
        __name = _name;
    }

    function changeDescription(string memory _description) public onlyOwner {
        description = _description;
    }

    function changeImageUri(string memory _imageUri) public onlyOwner {
        imageUri = _imageUri;
    }

    function changeExternalUrl(string memory _externalUrl) public onlyOwner {
        externalUrl = _externalUrl;
    }

    function batchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId) public onlyOwner {
        emit BatchMetadataUpdate(_fromTokenId, _toTokenId);
    }

    // ************************************* //
    // *        ERC-721 Functions          * //
    // ************************************* //

    function name() public view override returns (string memory) {
        return __name;
    }

    function tokenURI(uint256 /*_tokenId*/) public view override returns (string memory) {
        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name":"',
                    __name,
                    '","description":"',
                    description,
                    '","image":"',
                    imageUri,
                    '", "external_url":"',
                    externalUrl,
                    '"}'
                )
            )
        );
        return string.concat("data:application/json;base64,", json);
    }

    function safeMint(address _to) public onlyOwner returns (uint256) {
        if (balanceOf(_to) > 0) revert AddressAlreadyHasToken();
        uint256 tokenId = __nextTokenId++;
        _safeMint(_to, tokenId);
        emit MetadataUpdate(tokenId);
        return tokenId;
    }

    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert TransfersNotPermitted();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert TransfersNotPermitted();
    }

    function _update(
        address _to,
        uint256 _tokenId,
        address _auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(_to, _tokenId, _auth);
    }

    // ************************************* //
    // *        ERC-165 Functions          * //
    // ************************************* //

    function supportsInterface(bytes4 _interfaceId) public view override(ERC721, IERC165) returns (bool) {
        return _interfaceId == ERC4906_INTERFACE_ID || super.supportsInterface(_interfaceId);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //
    error AddressAlreadyHasToken();
}
