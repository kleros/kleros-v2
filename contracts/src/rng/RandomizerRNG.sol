// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IRNG} from "./IRNG.sol";
import {IRandomizer} from "./IRandomizer.sol";

/// @title Random Number Generator that uses Randomizer.ai
/// https://randomizer.ai/
contract RandomizerRNG is IRNG {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The address that can withdraw funds.
    address public consumer; // The address that can request random numbers.
    IRandomizer public randomizer; // Randomizer address.
    uint256 public callbackGasLimit; // Gas limit for the Randomizer.ai callback.
    uint256 public lastRequestId; // The last request ID.
    mapping(uint256 requestId => uint256 number) public randomNumbers; // randomNumbers[requestID] is the random number for this request id, 0 otherwise.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a request is sent to the VRF Coordinator
    /// @param requestId The ID of the request
    event RequestSent(uint256 indexed requestId);

    /// Emitted when a request has been fulfilled.
    /// @param requestId The ID of the request
    /// @param randomWords The random values answering the request.
    event RequestFulfilled(uint256 indexed requestId, uint256 randomWords);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    modifier onlyByConsumer() {
        if (consumer != msg.sender) revert ConsumerOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor
    /// @param _owner The Owner of the contract.
    /// @param _consumer The address that can request random numbers.
    /// @param _randomizer The Randomizer.ai oracle contract.
    constructor(address _owner, address _consumer, IRandomizer _randomizer) {
        owner = _owner;
        consumer = _consumer;
        randomizer = _randomizer;
        callbackGasLimit = 50000;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @notice Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the consumer of the RNG.
    /// @param _consumer The new consumer.
    function changeConsumer(address _consumer) external onlyByOwner {
        consumer = _consumer;
    }

    /// @notice Change the Randomizer callback gas limit.
    /// @param _callbackGasLimit the new limit.
    function setCallbackGasLimit(uint256 _callbackGasLimit) external onlyByOwner {
        callbackGasLimit = _callbackGasLimit;
    }

    /// @notice Change the Randomizer address.
    /// @param _randomizer the new Randomizer address.
    function setRandomizer(address _randomizer) external onlyByOwner {
        randomizer = IRandomizer(_randomizer);
    }

    /// @notice Allows the owner to withdraw randomizer funds.
    /// @param _amount Amount to withdraw in wei.
    function randomizerWithdraw(uint256 _amount) external onlyByOwner {
        randomizer.clientWithdrawTo(msg.sender, _amount);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Request a random number.
    /// @dev Consumer only.
    function requestRandomness() external override onlyByConsumer {
        uint256 requestId = randomizer.request(callbackGasLimit);
        lastRequestId = requestId;
        emit RequestSent(requestId);
    }

    /// @notice Callback function called by the randomizer contract when the random value is generated.
    /// @param _id The ID of the request.
    /// @param _value The random value answering the request.
    function randomizerCallback(uint256 _id, bytes32 _value) external {
        if (msg.sender != address(randomizer)) revert RandomizerOnly();
        randomNumbers[_id] = uint256(_value);
        emit RequestFulfilled(_id, uint256(_value));
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Return the random number.
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external view override returns (uint256 randomNumber) {
        randomNumber = randomNumbers[lastRequestId];
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error RandomizerOnly();
}
