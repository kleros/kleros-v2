//SPDX-License-Identifier: MIT

/**
 *  @authors: [@malatrax]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */
pragma solidity 0.8.18;

import "./interfaces/VRFCoordinatorV2Interface.sol";
import "./interfaces/LinkTokenInterface.sol";

/**
 * @title VRF Coordinator Manager
 * @author Simon Malatrait <simon.malatrait@grenoble-inp.org>
 * @dev This contracts implements a subscription manager for using VRF v2 with the Subscription Method.
 * @dev It allows to create subscriptions, manage them and consumers.
 * @dev LINK Token Arbitrum: https://docs.chain.link/resources/link-token-contracts?parent=vrf#arbitrum
 * @dev VRFCoordinatorV2 address: https://docs.chain.link/vrf/v2/subscription/supported-networks#arbitrum-mainnet
 * @dev For SECURITY CONSIDERATIONS, you might also have a look to: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/vrf/VRFCoordinatorV2.sol
 */
contract VRFSubscriptionManagerV2 {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * Emitted when LINK tokens are sent from this contract to the current subscription.
     * @param subscriptionId ID of the funded subscription
     * @param amount Amount of LINK token, in wei.
     */
    event SubscriptionFunded(uint64 subscriptionId, uint256 amount);

    /**
     * @dev Emitted when the governor withdraws `amount` LINK from the subscription manager.
     * @param receiver Address of the receiving address, the governor address
     * @param amount Amount of LINK tokens withdrawn, in wei.
     */
    event LinkWithdrawn(address indexed receiver, uint256 indexed amount);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    VRFCoordinatorV2Interface public vrfCoordinator;
    LinkTokenInterface public linkToken;
    uint64 public subscriptionId;
    address public governor;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(msg.sender == governor, "Access not allowed: Governor only");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /**
     * @dev Constructs the Chainlink VRF v2 Subscription Manager.
     * @param _governor The Governor of the contract
     * @param _vrfCoordinator The address of the VRFCoordinator contract.
     * @param _linkToken The address of the LINK token.
     */
    constructor(address _governor, address _vrfCoordinator, address _linkToken) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        linkToken = LinkTokenInterface(_linkToken);
        governor = _governor;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /**
     * @dev Changes the `vrfCoordinator` storage variable.
     * @param _vrfCoordinator The new value for the `vrfCoordinator` storage variable.
     */
    function changeVrfCoordinator(address _vrfCoordinator) external onlyByGovernor {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Request the ownership transfer of the current subscription to `newOwner`
     * @dev The current owner of the subscription is the Subscription Manager contract
     * @param newOwner Address of the proposed new owner of the current subscription
     * Note: Transferring the ownership should be used when migrating a subscription from one Subscription Manager to another without removing the consumers nor cancelling the subscription
     */
    function requestSubscriptionOwnerTransfer(address newOwner) external onlyByGovernor {
        vrfCoordinator.requestSubscriptionOwnerTransfer(subscriptionId, newOwner);
    }

    /**
     * @dev Accept the subscription transfer of ownership.
     * @param _subscriptionId ID of the subscription to be accepted. It will override the current subscription if any.
     */
    function acceptSubscriptionOwnerTransfer(uint64 _subscriptionId) external onlyByGovernor {
        vrfCoordinator.acceptSubscriptionOwnerTransfer(_subscriptionId);
        subscriptionId = _subscriptionId;
    }

    /**
     * @dev Creates a new subscription, overriding the previous one to be manageable by the contract.
     */
    function createNewSubscription() external onlyByGovernor {
        subscriptionId = vrfCoordinator.createSubscription();
    }

    /**
     * @dev Funds the current subscription by `amount` LINK tokens.
     * @param amount Amount of LINK token in wei.
     */
    function topUpSubscription(uint256 amount) external {
        linkToken.transferAndCall(address(vrfCoordinator), amount, abi.encode(subscriptionId));
        emit SubscriptionFunded(subscriptionId, amount);
    }

    /**
     * @dev Add a Consumer to the subscription.
     * @param consumer Address of the Consumer contract added to the subscription.
     */
    function addConsumer(address consumer) external onlyByGovernor {
        // Add a consumer contract to the subscription.
        vrfCoordinator.addConsumer(subscriptionId, consumer);
    }

    /**
     * @dev Removes a Consumer to the subscription
     * @param consumer Address of the Consumer contract removed from the subscription.
     */
    function removeConsumer(address consumer) external onlyByGovernor {
        // Remove a consumer contract from the subscription.
        vrfCoordinator.removeConsumer(subscriptionId, consumer);
    }

    /**
     * @dev Cancel the current subscription and send the remaining LINK of the subscription to the governor.
     */
    function cancelSubscriptionToGovernor() external onlyByGovernor {
        vrfCoordinator.cancelSubscription(subscriptionId, governor);
        subscriptionId = 0;
    }

    /**
     * @dev Transfers `amount` LINK tokens of the Subscription Manager (this contract) to the governor.
     * @param amount Amount of LINK token in wei.
     */
    function withdrawLinkToGovernor(uint256 amount) external onlyByGovernor {
        linkToken.transfer(governor, amount);
        emit LinkWithdrawn(governor, amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Returns information on the current subscription
     * @return balance LINK token balance of the current subscription.
     * @return reqCount Number of requests made to the subscription.
     * @return owner Address of the current owner of the subscription.
     * @return consumers List of consumers subscribed to the current subscription.
     */
    function getSubscription()
        external
        view
        returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)
    {
        (balance, reqCount, owner, consumers) = vrfCoordinator.getSubscription(subscriptionId);
    }
}
