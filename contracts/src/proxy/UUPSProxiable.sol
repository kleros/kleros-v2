//SPDX-License-Identifier: MIT

/**
 *  @authors: [@malatrax]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */
pragma solidity 0.8.18;

/**
 * @title UUPS Proxiable
 * @author Simon Malatrait <simon.malatrait@grenoble-inp.org>
 * @dev This contract implements an upgradeability mechanism designed for UUPS proxies.
 * The functions included here can perform an upgrade of an UUPS Proxy, when this contract is set as the implementation behind such a proxy.
 *
 * IMPORTANT: A UUPS proxy requires its upgradeability functions to be in the implementation as opposed to the transparent proxy.
 * This means that if the proxy is upgraded to an implementation that does not support this interface, it will no longer be upgradeable.
 *
 * A security mechanism ensures that an upgrade does not turn off upgradeability accidentally, although this risk is
 * reinstated if the upgrade retains upgradeability but removes the security mechanism, e.g. by replacing
 * `UUPSProxiable` with a custom implementation of upgrades.
 *
 * The `_authorizeUpgrade` function must be overridden to include access restriction to the upgrade mechanism.
 */
abstract contract UUPSProxiable {
    // ************************************* //
    // *             Event                 * //
    // ************************************* //

    /**
     * Emitted when the `implementation` has been successfully upgraded.
     * @param newImplementation Address of the new implementation the proxy is now forwarding calls to.
     */
    event Upgraded(address indexed newImplementation);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
     * validated in the constructor.
     * NOTE: bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
     */
    bytes32 private constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Storage variable of the proxiable contract address.
     * It is used to check whether or not the current call is from the proxy.
     */
    address private immutable __self = address(this);

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract.
     * @dev Called by {upgradeToAndCall}.
     */
    function _authorizeUpgrade(address newImplementation) internal virtual;

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// The `implementation` is not UUPS-compliant
    error InvalidImplementation(address implementation);

    /**
     * @dev Upgrade mechanism including access control and UUPS-compliance.
     * @param newImplementation Address of the new implementation contract.
     * @param data Data used in a delegate call to `newImplementation` if non-empty. This will typically be an encoded
     * function call, and allows initializing the storage of the proxy like a Solidity constructor.
     *
     * @dev Reverts if the execution is not performed via delegatecall or the execution
     * context is not of a proxy with an ERC1967-compliant implementation pointing to self.
     */
    function upgradeToAndCall(address newImplementation, bytes memory data) public payable virtual {
        _authorizeUpgrade(newImplementation);

        /* Check that the execution is being performed through a delegatecall call and that the execution context is
        a proxy contract with an implementation (as defined in ERC1967) pointing to self. */
        require(address(this) != __self, "Must be called through delegatecall");
        require(_getImplementation() == __self, "Must be called through an active proxy");

        try UUPSProxiable(newImplementation).proxiableUUID() returns (bytes32 slot) {
            require(slot == IMPLEMENTATION_SLOT, "Unsupported Proxiable UUID");
            // Store the new implementation address to the implementation storage slot.
            assembly {
                sstore(IMPLEMENTATION_SLOT, newImplementation)
            }
            emit Upgraded(newImplementation);

            if (data.length != 0) {
                // The return data is not checked (checking, in case of success, that the newImplementation code is non-empty if the return data is empty) because the authorized callee is trusted.
                (bool success, ) = newImplementation.delegatecall(data);
                require(success, "Unsuccessful delegatecall");
            }
        } catch {
            revert InvalidImplementation(newImplementation);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Implementation of the ERC1822 `proxiableUUID` function. This returns the storage slot used by the
     * implementation. It is used to validate the implementation's compatibility when performing an upgrade.
     *
     * IMPORTANT: A proxy pointing at a proxiable contract should not be considered proxiable itself, because this risks
     * bricking a proxy that upgrades to it, by delegating to itself until out of gas. Thus it is critical that this
     * function revert if invoked through a proxy. This is guaranteed by the require statement.
     */
    function proxiableUUID() external view virtual returns (bytes32) {
        require(address(this) == __self, "Must not be called through delegatecall");
        return IMPLEMENTATION_SLOT;
    }

    // ************************************* //
    // *           Internal Views          * //
    // ************************************* //

    function _getImplementation() internal view returns (address implementation) {
        assembly {
            implementation := sload(IMPLEMENTATION_SLOT)
        }
    }
}
