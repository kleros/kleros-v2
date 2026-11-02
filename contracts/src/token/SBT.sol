// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

/// @title SBT
/// @notice Minimal non-transferable soulbound token.
contract SBT {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The contract owner.

    string public name; // Token name.
    string public symbol; // Token symbol.
    string public metadataURI; // Shared metadata URI for all tokens.

    uint256 public nextTokenId; // Next token ID to mint.

    mapping(address account => uint256 balance) public balanceOf; // Number of tokens held by an account.
    mapping(uint256 tokenId => address account) public ownerOf; // Owner of each token.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a token is minted or burned.
    /// @param from Previous token owner. Zero address when minting.
    /// @param to New token owner. Zero address when burning.
    /// @param tokenId Token ID.
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor.
    /// @param _name Token name.
    /// @param _symbol Token symbol.
    /// @param _metadataURI Shared metadata URI for all tokens.
    constructor(string memory _name, string memory _symbol, string memory _metadataURI) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        metadataURI = _metadataURI;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Changes the contract owner.
    /// @param _owner New owner address.
    function changeOwner(address _owner) external {
        require(msg.sender == owner, NotAuthorized());
        owner = _owner;
    }

    // ************************************* //
    // *               Token               * //
    // ************************************* //

    /// @notice Mints an SBT to an address.
    /// @dev An address can hold at most one token.
    /// @param _to Recipient address.
    /// @return tokenId Minted token ID.
    function mint(address _to) external returns (uint256 tokenId) {
        require(msg.sender == owner, NotAuthorized());
        require(_to != address(0), InvalidAddress());
        require(balanceOf[_to] == 0, AddressAlreadyHasToken());

        tokenId = nextTokenId++;

        balanceOf[_to] = 1;
        ownerOf[tokenId] = _to;

        emit Transfer(address(0), _to, tokenId);
    }

    /// @notice Burns an SBT.
    /// @dev The token holder can burn their token and the contract owner can revoke it.
    /// @param _tokenId Token ID to burn.
    function burn(uint256 _tokenId) external {
        address tokenOwner = ownerOf[_tokenId];

        require(tokenOwner != address(0), TokenDoesNotExist());
        require(msg.sender == tokenOwner || msg.sender == owner, NotAuthorized());

        balanceOf[tokenOwner] = 0;
        delete ownerOf[_tokenId];

        emit Transfer(tokenOwner, address(0), _tokenId);
    }

    // ************************************* //
    // *         Soulbound Behavior        * //
    // ************************************* //

    /// @notice Transfers are disabled for this contract.
    function transferFrom(address, address, uint256) external pure {
        revert TransfersNotPermitted();
    }

    /// @notice Transfers are disabled for this contract.
    function safeTransferFrom(address, address, uint256) external pure {
        revert TransfersNotPermitted();
    }

    /// @notice Transfers are disabled for this contract.
    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert TransfersNotPermitted();
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error NotAuthorized();
    error InvalidAddress();
    error AddressAlreadyHasToken();
    error TokenDoesNotExist();
    error TransfersNotPermitted();
}
