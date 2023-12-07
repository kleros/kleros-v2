//SPDX-License-Identifier: MIT

/**
 *  @authors: [@malatrax]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */
pragma solidity 0.8.18;

import "./VRFCoordinatorV2InterfaceMock.sol";

/**
 * @title VRF Coordinator Manager Mock
 * @author Simon Malatrait <simon.malatrait@grenoble-inp.org>
 * @dev This contracts implements a subscription manager for using VRF v2 with the Subscription Method.
 * @dev It allows to create subscriptions, manage them and consumers.
 * @dev VRFCoordinatorV2 address: https://docs.chain.link/vrf/v2/subscription/supported-networks#arbitrum-mainnet
 * @dev For SECURITY CONSIDERATIONS, you might also have a look to: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/vrf/VRFCoordinatorV2.sol
 */
contract VRFSubscriptionManagerV2Mock {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * Emitted when LINK tokens are sent from this contract to the current subscription.
     * @param subscriptionId ID of the funded subscription
     * @param amount Amount of LINK token, in wei.
     */
    event SubscriptionFunded(uint64 subscriptionId, uint256 amount);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    VRFCoordinatorV2InterfaceMock public vrfCoordinator;
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
     */
    constructor(address _governor, address _vrfCoordinator) {
        vrfCoordinator = VRFCoordinatorV2InterfaceMock(_vrfCoordinator);
        governor = _governor;
        createNewSubscription();
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /**
     * @dev Changes the `vrfCoordinator` storage variable.
     * @param _vrfCoordinator The new value for the `vrfCoordinator` storage variable.
     */
    function changeVrfCoordinator(address _vrfCoordinator) external onlyByGovernor {
        vrfCoordinator = VRFCoordinatorV2InterfaceMock(_vrfCoordinator);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Creates a new subscription, overriding the previous one to be manageable by the contract.
     */
    function createNewSubscription() public onlyByGovernor {
        subscriptionId = vrfCoordinator.createSubscription();
    }

    /**
     * @dev Funds the current subscription by `amount` LINK tokens.
     * @param amount Amount of LINK token in wei.
     */
    function topUpSubscription(uint96 amount) external {
        vrfCoordinator.fundSubscription(subscriptionId, amount);
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
