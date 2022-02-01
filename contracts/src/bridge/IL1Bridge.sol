// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * This is essentially an interface but defined as an abstract contract
 * to declare functions as internal instead of as external
 */
abstract contract IL1Bridge {
    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @dev The caller needs to pay some ETH to cover the gas costs
     * of the call on L2. Excess ETH that is not used by gas costs will
     * be refunded to the `msg.sender` address on L2.
     *
     * @notice if a user does not desire immediate redemption, they should
     * provide a DepositValue of at least CallValue + MaxSubmissionCost.
     * If they do desire immediate execution, they should provide a DepositValue
     * of at least CallValue + MaxSubmissionCost + (GasPrice x MaxGas).
     *
     * @param _calldata The L2 encoded message data.
     * @param _maxGas Gas limit for immediate L2 execution attempt.
     * @param _gasPriceBid L2 Gas price bid for immediate L2 execution attempt.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) public payable virtual returns (uint256);

    function getSubmissionPrice(uint256 _calldatasize) public view virtual returns (uint256);

    function onlyAuthorized() public view virtual;
}
