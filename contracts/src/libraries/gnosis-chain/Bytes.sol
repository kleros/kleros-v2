//https://github.com/poanetwork/tokenbridge-contracts/blob/master/contracts/libraries/Bytes.sol

pragma solidity ^0.8.0;

/**
 * @title Bytes
 * @dev Helper methods to transform bytes to other solidity types.
 */
library Bytes {
    /**
     * @dev Converts bytes array to bytes32.
     * Truncates bytes array if its size is more than 32 bytes.
     * NOTE: This function does not perform any checks on the received parameter.
     * Make sure that the _bytes argument has a correct length, not less than 32 bytes.
     * A case when _bytes has length less than 32 will lead to the undefined behaviour,
     * since assembly will read data from memory that is not related to the _bytes argument.
     * @param _bytes to be converted to bytes32 type
     * @return result bytes32 type of the firsts 32 bytes array in parameter.
     */
    function bytesToBytes32(bytes memory _bytes) internal pure returns (bytes32 result) {
        assembly {
            result := mload(add(_bytes, 32))
        }
    }

    /**
     * @dev Truncate bytes array if its size is more than 20 bytes.
     * NOTE: Similar to the bytesToBytes32 function, make sure that _bytes is not shorter than 20 bytes.
     * @param _bytes to be converted to address type
     * @return addr address included in the firsts 20 bytes of the bytes array in parameter.
     */
    function bytesToAddress(bytes memory _bytes) internal pure returns (address addr) {
        assembly {
            addr := mload(add(_bytes, 20))
        }
    }
}
