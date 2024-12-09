// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./IRNG.sol";
import "./IRandomizer.sol";
import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";

/// @title Random Number Generator that uses Randomizer.ai
/// https://randomizer.ai/
contract RandomizerRNG is IRNG, UUPSProxiable, Initializable {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The address that can withdraw funds.
    address public consumer; // The address that can request random numbers.
    IRandomizer public randomizer; // Randomizer address.
    uint256 public callbackGasLimit; // Gas limit for the Randomizer.ai callback.
    uint256 lastRequestId; // The last request ID.
    mapping(uint256 requestId => uint256 number) public randomNumbers; // randomNumbers[requestID] is the random number for this request id, 0 otherwise.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev Emitted when a request is sent to the VRF Coordinator
    /// @param requestId The ID of the request
    event RequestSent(uint256 indexed requestId);

    /// Emitted when a request has been fulfilled.
    /// @param requestId The ID of the request
    /// @param randomWords The random values answering the request.
    event RequestFulfilled(uint256 indexed requestId, uint256 randomWords);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Governor only");
        _;
    }

    modifier onlyByConsumer() {
        require(consumer == msg.sender, "Consumer only");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer
    /// @param _randomizer Randomizer contract.
    /// @param _governor Governor of the contract.
    function initialize(address _governor, address _consumer, IRandomizer _randomizer) external reinitializer(1) {
        governor = _governor;
        consumer = _consumer;
        randomizer = _randomizer;
        callbackGasLimit = 50000;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the governor can perform upgrades (`onlyByGovernor`)
     */
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the governor of the contract.
    /// @param _governor The new governor.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the consumer of the RNG.
    /// @param _consumer The new consumer.
    function changeConsumer(address _consumer) external onlyByGovernor {
        consumer = _consumer;
    }

    /// @dev Change the Randomizer callback gas limit.
    /// @param _callbackGasLimit the new limit.
    function setCallbackGasLimit(uint256 _callbackGasLimit) external onlyByGovernor {
        callbackGasLimit = _callbackGasLimit;
    }

    /// @dev Change the Randomizer address.
    /// @param _randomizer the new Randomizer address.
    function setRandomizer(address _randomizer) external onlyByGovernor {
        randomizer = IRandomizer(_randomizer);
    }

    /// @dev Allows the governor to withdraw randomizer funds.
    /// @param _amount Amount to withdraw in wei.
    function randomizerWithdraw(uint256 _amount) external onlyByGovernor {
        randomizer.clientWithdrawTo(msg.sender, _amount);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Request a random number. Consumer only.
    function requestRandomness() external override onlyByConsumer {
        uint256 requestId = randomizer.request(callbackGasLimit);
        lastRequestId = requestId;
        emit RequestSent(requestId);
    }

    /// @dev Callback function called by the randomizer contract when the random value is generated.
    /// @param _id The ID of the request.
    /// @param _value The random value answering the request.
    function randomizerCallback(uint256 _id, bytes32 _value) external {
        require(msg.sender == address(randomizer), "Randomizer only");
        randomNumbers[_id] = uint256(_value);
        emit RequestFulfilled(_id, uint256(_value));
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Return the random number.
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness() external view override returns (uint256 randomNumber) {
        randomNumber = randomNumbers[lastRequestId];
    }
}
