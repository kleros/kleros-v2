// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestERC1155 is ERC1155 {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner;
    uint256 private _nextTokenId;

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor() ERC1155("") {
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

    function mint(address to, uint256 id, uint256 value, bytes memory data) external ownerOnly {
        _mint(to, id, value, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) external ownerOnly {
        _mintBatch(to, ids, values, data);
    }

    function burn(address from, uint256 id, uint256 value) external ownerOnly {
        _burn(from, id, value);
    }

    function burnBatch(address from, uint256[] memory ids, uint256[] memory values) external ownerOnly {
        _burnBatch(from, ids, values);
    }
}
