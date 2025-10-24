// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract Faucet {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IERC20 public token;
    address public owner;
    mapping(address => bool) public withdrewAlready;
    uint256 public amount = 10_000 ether;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        require(address(owner) == msg.sender, "Access not allowed: Owner only.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor(IERC20 _token) {
        token = _token;
        owner = msg.sender;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeOwner(address _owner) public onlyByOwner {
        owner = _owner;
    }

    function changeAmount(uint256 _amount) public onlyByOwner {
        amount = _amount;
    }

    function withdraw() public onlyByOwner {
        token.transfer(owner, token.balanceOf(address(this)));
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function request() public {
        require(
            !withdrewAlready[msg.sender],
            "You have used this faucet already. If you need more tokens, please use another address."
        );
        token.transfer(msg.sender, amount);
        withdrewAlready[msg.sender] = true;
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function balance() public view returns (uint) {
        return token.balanceOf(address(this));
    }
}
