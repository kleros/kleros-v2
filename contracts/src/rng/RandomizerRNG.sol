// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "./RNG.sol";
import "./IRandomizer.sol";

/**
 *  @title Random Number Generator that uses Randomizer.ai
 *  https://randomizer.ai/
 */
contract RandomizerRNG is RNG {
    uint256 public constant CALLBACK_GAS_LIMIT = 50000;
    address public governor; // The address that can withdraw funds.

    IRandomizer public randomizer; // Randomizer address.
    mapping(uint128 => uint256) public randomNumbers; // randomNumbers[requestID] is the random number for this request id, 0 otherwise.
    mapping(address => uint128) public requesterToID; // Maps the requester to his latest request ID.

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Governor only");
        _;
    }

    /** @dev Constructor.
     *  @param _randomizer Randomizer contract.
     *  @param _governor Governor of the contract.
     */
    constructor(IRandomizer _randomizer, address _governor) {
        randomizer = _randomizer;
        governor = _governor;
    }

    /** @dev Changes the governor of the contract.
     *  @param _governor The new governor.
     */
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /**
     *  @dev Request a random number. The id of the request is tied to the sender.
     */
    function requestRandomness(uint256 /*_block*/) external override {
        uint128 id = uint128(randomizer.request(CALLBACK_GAS_LIMIT));
        requesterToID[msg.sender] = id;
    }

    /**
     *  @dev Return the random number.
     *  @return randomNumber The random number or 0 if it is not ready or has not been requested.
     */
    function receiveRandomness(uint256 /*_block*/) external view override returns (uint256 randomNumber) {
        // Get the latest request ID for this requester.
        uint128 id = requesterToID[msg.sender];
        randomNumber = randomNumbers[id];
    }

    /**
     *  @dev Callback function called by the randomizer contract when the random value is generated.
     */
    function randomizerCallback(uint128 _id, bytes32 _value) external {
        require(msg.sender == address(randomizer), "Caller not Randomizer");
        randomNumbers[_id] = uint256(_value);
    }

    /**
     *  @dev Allows the governor to withdraw randomizer funds.
     *  @param _amount Amount to withdraw in wei.
     */
    function randomizerWithdraw(uint256 _amount) external onlyByGovernor {
        randomizer.clientWithdrawTo(msg.sender, _amount);
    }
}
