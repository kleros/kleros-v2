// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./RNG.sol";
import "./IRandomizer.sol";
import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";

/// @title Random Number Generator that uses Randomizer.ai
/// https://randomizer.ai/
contract RandomizerRNG is RNG, UUPSProxiable, Initializable {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The address that can withdraw funds.
    uint256 public callbackGasLimit; // Gas limit for the randomizer callback
    IRandomizer public randomizer; // Randomizer address.
    mapping(uint256 => uint256) public randomNumbers; // randomNumbers[requestID] is the random number for this request id, 0 otherwise.
    mapping(address => uint256) public requesterToID; // Maps the requester to his latest request ID.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Governor only");
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
    function initialize(IRandomizer _randomizer, address _governor) external reinitializer(1) {
        randomizer = _randomizer;
        governor = _governor;
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

    /// @dev Request a random number. The id of the request is tied to the sender.
    function requestRandomness(uint256 /*_block*/) external override {
        uint256 id = randomizer.request(callbackGasLimit);
        requesterToID[msg.sender] = id;
    }

    /// @dev Callback function called by the randomizer contract when the random value is generated.
    function randomizerCallback(uint256 _id, bytes32 _value) external {
        require(msg.sender == address(randomizer), "Randomizer only");
        randomNumbers[_id] = uint256(_value);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Return the random number.
    /// @return randomNumber The random number or 0 if it is not ready or has not been requested.
    function receiveRandomness(uint256 /*_block*/) external view override returns (uint256 randomNumber) {
        // Get the latest request ID for this requester.
        uint256 id = requesterToID[msg.sender];
        randomNumber = randomNumbers[id];
    }
}
