// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

/**
 *  @title SimpleSquanch
 *  @dev A library of functions to serialize data
 */
library SimpleSquanch {

    /**
     *  @dev Serializes data by encoding input+1 to reserve zero for an End Of File signal.
     *  @param _input Input to be serialized.
     *  @param _result Serialized 'Squanched' result.
     */
    function squanch(bytes32[] calldata _input) public pure returns (bytes32[] memory _result){

        assembly {
            _result := mload(0x40)  // free memory pointer
            let lengthInput := calldataload(0x24)   // skip 4 bytes function selector
            let _cursor := add(_result,0x3F)    // skip length and starting from right to left
            for { let i := 0} lt(i, lengthInput) { i:= add(i, 1)}{

                let _encodedInputSlot := encode(add(calldataload(add(mul(0x20,i),0x44)),1))

                for {} gt(_encodedInputSlot, 0) { }{

                    mstore8(_cursor,_encodedInputSlot)
                    _encodedInputSlot := shr(8,_encodedInputSlot)

                    // shift cursor to next 32bytes
                    switch mod(sub(_cursor,_result),0x20)
                    case 0{
                        _cursor := add(_cursor,0x3F)
                    }
                    default{
                        _cursor := sub(_cursor,1)
                    }
                }
            }
            
            switch mod(sub(_cursor,_result),0x20)
            case 0x1F{
                mstore(_result,sub(div(sub(_cursor,_result),0x20),1)) // store length
                // align cursor to end on a multiple of 32 bytes
                _cursor := sub(_cursor,0x1F)
                mstore(0x40, _cursor)
            }
            default{
                mstore(_result,div(sub(_cursor,_result),0x20)) // store length
                // align cursor to end on a multiple of 32 bytes
                _cursor := add(_cursor,sub(0x20, mod(sub(_cursor,_result),0x20)))
                mstore(0x40, _cursor)
            }
            /**
            *  @dev Serializes data with SSQ.
            *  @param _inputSlot Input 32 bytes to be serialized.
            *  @param _resultSlot Serialized 'Squanched' result.
            */
            function encode(_inputSlot) -> _resultSlot {
                let i := 0
                for { } gt(_inputSlot,0x7F) {i := add(i,1)} {
                    _resultSlot := add(_resultSlot,shl(mul(8,i),add(0x80,and(_inputSlot, 0x7F))))
                    _inputSlot := shr(7,_inputSlot)
                }
                _resultSlot := add(_resultSlot,shl(mul(8,i),and(_inputSlot, 0x7F)))
            }
        }
    }
    /**
     *  @dev Deserializes data by decoding input and adding 1 to revert the squanch encoding.
     *  @param _input Input to be deserialized.
     *  @param _result Deserialized 'Unsquanched' result.
     */
    function unsquanch(bytes32[] calldata _input) public pure returns (bytes32[] memory _result){

        assembly {

            _result := mload(0x40)
            let cursor := add(_result,0x20)
            let calldataCursor := 0x24
            let encodedLength := calldataload(calldataCursor)

            let encoded := 0
            let decoded := 0

            let decodedIndex := 0 
            for { let i := 0} lt(i,encodedLength) {i := add(i,1)} { 
                calldataCursor := add(calldataCursor,0x20)
                encoded := calldataload(calldataCursor)

                for { let j := 0 } lt(j,0x20) {j := add(j,1)} {
                    decoded := add(decoded,shl(mul(7,decodedIndex),and(encoded, 0x7F)))
                    switch and(encoded,0x80)
                    case 0{
                        mstore(cursor,sub(decoded,1))
                        cursor := add(cursor,0x20)
                        decoded := 0
                        decodedIndex := 0
                    }
                    default{
                        decodedIndex := add(decodedIndex, 1)
                    }
                    encoded := shr(8,encoded)
                    if eq(encoded,0){   // EOF
                        j := 0x20
                    }
                }
            }

            mstore(_result,sub(div(sub(cursor,_result),0x20),0x01)) // store length
            mstore(0x40, cursor) // Update/return the result array ofsset + length of the data (=i*32)
            
        }
    }
    /**
     *  @dev Deserializes data by decoding input and adding 1 to revert the squanch encoding.
     *  @param _input Input to be deserialized.
     *  @param _result Deserialized 'Unsquanched' result.
     */
    function unsquanch(bytes32 _input) public pure returns (bytes32[] memory _result){

        assembly {

            _result := mload(0x40)
            let cursor := add(_result,0x20)
            let decoded := 0
            let decodedIndex := 0 
            let encoded := calldataload(0x04)

            for { let j := 0 } lt(j,0x20) {j := add(j,1)} {
                decoded := add(decoded,shl(mul(7,decodedIndex),and(encoded, 0x7F)))
                switch and(encoded,0x80)
                case 0{
                    mstore(cursor,sub(decoded,1))
                    cursor := add(cursor,0x20)
                    decoded := 0
                    decodedIndex := 0
                }
                default{
                    decodedIndex := add(decodedIndex, 1)
                }
                encoded := shr(8,encoded)
                if eq(encoded,0){   // EOF
                    j := 0x20
                }
            }

            mstore(_result,sub(div(sub(cursor,_result),0x20),0x01)) // store length
            mstore(0x40, cursor) // Update/return the result array ofsset + length of the data (=i*32)
            
        }
    }
    /**
     *  @dev Serializes data by encoding input with SSQ.
     *  @param _input Input to be serialized.
     *  @param _result Serialized 'Squanched' result.
     */
    function encode(bytes32 _input) public pure returns (bytes32  _result){
        assembly {
            let i := 0
            for { } gt(_input,0x7F) {i := add(i,1)} {
                _result := add(_result,shl(mul(8,i),add(0x80,and(_input, 0x7F))))
                _input := shr(7,_input)
            }
            _result := add(_result,shl(mul(8,i),and(_input, 0x7F)))
        }
    }   
    /**
     *  @dev Deserializes data by reversing SSQ
     *  @param _input Input to be deserialized.
     *  @param _result Deserialized 'Unsquanched' result.
     */
    function decode(bytes32 _input) public pure returns (bytes32 _result){
        assembly {
            for { let i := 0x0 } gt(_input,0) {i := add(i,0x1)} {
                _result := add(_result,shl(mul(7,i),and(_input, 0x7F)))
                _input := shr(8,_input)
            }
        }
    } 
}
