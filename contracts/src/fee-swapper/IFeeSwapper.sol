// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

interface IFeeSwapper {
    function requestSwap(uint256 _disputeID, bytes memory _extraData) external payable returns (uint256 requestID);

    function swapToWETH(uint256 _requestID) external returns (uint256 returnAmount, uint256 fee);

    function getAmountOut(uint256 _amountIn) external view returns (uint256);
}
