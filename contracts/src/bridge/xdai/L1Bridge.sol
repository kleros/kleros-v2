// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IAMB.sol";

import "../IL1Bridge.sol";

contract L1Bridge is IL1Bridge {
    address public l2Target;
    IAMB amb;

    constructor(address _l2Target, IAMB _amb) {
        l2Target = _l2Target;
        amb = _amb;
    }

    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) external payable returns (uint256) {
        bytes32 id = amb.requireToPassMessage(l2Target, _calldata, amb.maxGasPerTx());
        return uint256(id);
    }

    /**
     * @dev The xDai bridge gas cost doesn't depend on the calldata size
     *
     */
    function getSubmissionPrice(
        uint256 /* _calldatasize */
    ) public view returns (uint256) {
        return 0;
    }

    function onlyAuthorized(address _sender) external {
        require(_sender == address(amb), "Only AMB allowed");
        //require(amb.messageSourceChainId() == homeChainId, "Only home chain allowed");
        require(amb.messageSender() == l2Target, "Only home proxy allowed");
    }
}
