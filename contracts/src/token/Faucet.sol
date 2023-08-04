// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Faucet {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IERC20 public token;
    address public governor;
    mapping(address => bool) public withdrewAlready;
    uint256 public amount = 10_000 ether;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(address(governor) == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor(IERC20 _token) {
        token = _token;
        governor = msg.sender;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeGovernor(address _governor) public onlyByGovernor {
        governor = _governor;
    }

    function changeAmount(uint256 _amount) public onlyByGovernor {
        amount = _amount;
    }

    function withdraw() public onlyByGovernor {
        token.transfer(governor, token.balanceOf(address(this)));
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
