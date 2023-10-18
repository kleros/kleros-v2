//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/proxy/ERC1967/ERC1967Proxy.sol>

/**
 *  @authors: [@malatrax]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */
pragma solidity 0.8.18;

/**
 * @title UUPS Proxy
 * @author Simon Malatrait <simon.malatrait@grenoble-inp.org>
 * @dev This contract implements a UUPS Proxy compliant with ERC-1967 & ERC-1822.
 * @dev This contract delegates all calls to another contract (UUPS Proxiable) through a fallback function and the use of the `delegatecall` EVM instruction.
 * @dev We refer to the Proxiable contract (as per ERC-1822) with `implementation`.
 */
contract UUPSProxy {
    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
     * validated in the constructor.
     * NOTE: bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
     */
    bytes32 private constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_implementation`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_implementation`. This will typically be an encoded
     * function call, and allows initializing the storage of the proxy like a Solidity constructor.
     */
    constructor(address _implementation, bytes memory _data) {
        assembly {
            sstore(IMPLEMENTATION_SLOT, _implementation)
        }

        if (_data.length != 0) {
            (bool success, ) = _implementation.delegatecall(_data);
            require(success, "Proxy Constructor failed");
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Delegates the current call to `implementation`.
     *
     * NOTE: This function does not return to its internal call site, it will return directly to the external caller.
     */
    function _delegate(address implementation) internal {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    // ************************************* //
    // *           Internal Views            * //
    // ************************************* //

    function _getImplementation() internal view returns (address implementation) {
        assembly {
            implementation := sload(IMPLEMENTATION_SLOT)
        }
    }

    // ************************************* //
    // *           Fallback                * //
    // ************************************* //

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback() external payable {
        _delegate(_getImplementation());
    }

    receive() external payable {
        _delegate(_getImplementation());
    }
}
