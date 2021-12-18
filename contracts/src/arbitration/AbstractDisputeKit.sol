// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "./IArbitrator.sol";

abstract contract AbstractDisputeKit {

    /**
     * Note: disputeID is maintained by Kleros Core, not the dispute kit
     * Note: the dispute kit does not receive any payment, Kleros Core does
     * Note: Permissioned
     */
    function createDispute(
        uint256 _disputeID,
        uint256 _arbitrationFee,
        uint256 _subcourtFeeForJuror,
        uint256 _subcourtMinStake,
        uint256 _subcourtAlpha,
        uint256 _choices,
        bytes calldata _extraData
    ) external virtual;

    /**
     *  @dev Draws jurors for a dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _iterations The number of iterations to run.
     */
    function drawJurors(uint256 _disputeID, uint256 _iterations) external virtual;

}
