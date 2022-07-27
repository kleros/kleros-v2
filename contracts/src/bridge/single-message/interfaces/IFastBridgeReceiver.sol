// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

interface IFastBridgeReceiver {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * @dev The Fast Bridge participants watch for these events to decide if a challenge should be submitted.
     * @param ticketID The ticket identifier referring to a message going through the bridge.
     * @param messageHash The claimed hash corresponding to this `ticketID`. It should match the hash from the sending side otherwise it will be challenged.
     * @param claimedAt The timestamp of the claim creation.
     */
    event ClaimReceived(uint256 indexed ticketID, bytes32 indexed messageHash, uint256 claimedAt);

    /**
     * @dev The Fast Bridge participants watch for these events to call `sendSafeFallback()` on the sending side.
     * @param ticketID The ticket identifier referring to a message going through the bridge.
     * @param challengedAt The timestamp of the challenge creation.
     */
    event ClaimChallenged(uint256 indexed ticketID, uint256 challengedAt);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /**
     * @dev Submit a claim about the `messageHash` for a particular Fast Bridge `ticketID` and submit a deposit. The `messageHash` should match the one on the sending side otherwise the sender will lose his deposit.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     * @param _messageHash The hash claimed for the ticket.
     */
    function claim(uint256 _ticketID, bytes32 _messageHash) external payable;

    /**
     * @dev Submit a challenge for a particular Fast Bridge `ticketID` and submit a deposit. The `messageHash` in the claim already made for this `ticketID` should be different from the one on the sending side, otherwise the sender will lose his deposit.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     */
    function challenge(uint256 _ticketID) external payable;

    /**
     * @dev Relay the message for this `ticketID` if the challenge period has passed and the claim is unchallenged. The hash computed over `messageData` and the other parameters must match the hash provided by the claim.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     * @param _blockNumber The block number on the cross-domain chain when the message with this ticketID has been sent.
     * @param _messageData The data on the cross-domain chain for the message sent with this ticketID.
     */
    function verifyAndRelay(
        uint256 _ticketID,
        uint256 _blockNumber,
        bytes calldata _messageData
    ) external;

    /**
     * Note: Access restricted to the Safe Bridge.
     * @dev Relay the message for this `ticketID` as provided by the Safe Bridge. Resolve a challenged claim for this `ticketID` if any.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     * @param _blockNumber The block number on the cross-domain chain when the message with this ticketID has been sent.
     * @param _messageData The data on the cross-domain chain for the message sent with this ticketID.
     */
    function verifyAndRelaySafe(
        uint256 _ticketID,
        uint256 _blockNumber,
        bytes calldata _messageData
    ) external;

    /**
     * @dev Sends the deposit back to the Bridger if his claim is not successfully challenged. Includes a portion of the Challenger's deposit if unsuccessfully challenged.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     */
    function withdrawClaimDeposit(uint256 _ticketID) external;

    /**
     * @dev Sends the deposit back to the Challenger if his challenge is successful. Includes a portion of the Bridger's deposit.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     */
    function withdrawChallengeDeposit(uint256 _ticketID) external;

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Returns the `start` and `end` time of challenge period for this `ticketID`.
     * @return start The start time of the challenge period.
     * @return end The end time of the challenge period.
     */
    function challengePeriod(uint256 _ticketID) external view returns (uint256 start, uint256 end);

    /**
     * @return amount The deposit required to submit a claim.
     */
    function claimDeposit() external view returns (uint256 amount);

    /**
     * @return amount The deposit required to submit a challenge.
     */
    function challengeDeposit() external view returns (uint256 amount);

    /**
     * @return amount The duration of the period allowing to challenge a claim.
     */
    function challengeDuration() external view returns (uint256 amount);

    /**
     * @return amount Basis point of claim or challenge deposit that are lost when dishonest.
     */
    function alpha() external view returns (uint256 amount);
}
