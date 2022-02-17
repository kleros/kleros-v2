// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

library SimpleSquanch {

    function encode(bytes32 _input) public pure returns (bytes32  result){
        assembly {
            result := 0x0
            let moreFlag := 0x0
            let i := 0x0
            for { } true { } {
                switch lt(_input, 0x80)
                case true{
                    result := add(result, add( moreFlag , shl(mul(8,i),_input)))
                    break
                }
                default{
                    moreFlag := add(0x80, shl(0x8,moreFlag))
                    result := add(result,shl(mul(8,i),and(_input, 0x7F)))
                    i := add(i,0x1)
                    _input := shr(7,_input)
                    continue
                }
                break
            }
        }
    }   

    function decode(bytes32 _input) public pure returns (bytes32  result){
        assembly {
            result := 0x0
            let i := 0x0
            for { } true { } {
                result := add(result,shl(mul(7,i),and(_input, 0x7F)))
                switch eq(and(_input, 0x80),0)
                case true{
                    break
                }
                default{
                    _input := shr(8,_input)
                    i := add(i,0x1)
                    continue
                }
                break
            }
        }
    } 
}
