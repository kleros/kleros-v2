// SPDX-License-Identifier: MIT

/**
 *  @authors: [@unknownunknown1, @jaybuidl]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8;

import "../IDisputeKit.sol";
import "../KlerosCore.sol";

/**
 *  @title BaseDisputeKit
 *  Provides common basic behaviours to the Dispute Kit implementations.
 */
abstract contract BaseDisputeKit is IDisputeKit {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    KlerosCore public core; // The Kleros Core arbitrator

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    modifier onlyByCore() {
        require(address(core) == msg.sender, "Access not allowed: KlerosCore only.");
        _;
    }

    /** @dev Constructor.
     *  @param _governor The governor's address.
     *  @param _core The KlerosCore arbitrator.
     */
    constructor(address _governor, KlerosCore _core) {
        governor = _governor;
        core = _core;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /** @dev Allows the governor to call anything on behalf of the contract.
     *  @param _destination The destination of the call.
     *  @param _amount The value sent with the call.
     *  @param _data The data sent with the call.
     */
    function executeGovernorProposal(
        address _destination,
        uint256 _amount,
        bytes memory _data
    ) external onlyByGovernor {
        (bool success, ) = _destination.call{value: _amount}(_data);
        require(success, "Unsuccessful call");
    }

    /** @dev Checks that the chosen address satisfies certain conditions for being drawn.
     *  @param _coreDisputeID ID of the dispute in the core contract.
     *  @param _juror Chosen address.
     *  @return Whether the address can be drawn or not.
     */
    function postDrawCheck(uint256 _coreDisputeID, address _juror) internal virtual returns (bool);
}
