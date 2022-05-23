// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/FastBridgeSenderBase.sol";
import "./interfaces/arbitrum/IArbSys.sol";
import "./interfaces/arbitrum/AddressAliasHelper.sol";

/**
 * Fast Bridge Sender to Ethereum from Arbitrum
 * Counterpart of `FastBridgeReceiverOnEthereum`
 */
contract FastBridgeSenderToEthereum is FastBridgeSenderBase {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbSys public constant ARB_SYS = IArbSys(address(100));

    /**
     * @dev Constructor.
     * @param _fastBridgeReceiver The address of the Fast Bridge on Ethereum.
     * @param _genesis The immutable genesis state variable from the FastBridgeSeneder.
     */
    constructor(
        IFastBridgeReceiver _fastBridgeReceiver,
        uint256 _epochPeriod,
        uint256 _genesis
    ) FastBridgeSenderBase(_fastBridgeReceiver, _epochPeriod, _genesis) {}

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (uint256) {
        uint256 withdrawalId = ARB_SYS.sendTxToL1(_receiver, _calldata);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }
}
