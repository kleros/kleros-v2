// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/FastBridgeSenderBase.sol";
import "./interfaces/gnosis-chain/IAMB.sol";
import "./interfaces/arbitrum/IArbSys.sol";
import "./interfaces/arbitrum/AddressAliasHelper.sol";

/**
 * Fast Bridge Sender to Gnosis from Arbitrum
 * Counterpart of `FastBridgeReceiverOnGnosis`
 */
contract FastBridgeSenderToGnosis is FastBridgeSenderBase {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbSys public constant ARB_SYS = IArbSys(address(100));
    IAMB public immutable amb;

    /**
     * @dev Constructor.
     * @param _fastBridgeReceiver The address of the Fast Bridge on Ethereum.
     * @param _epochPeriod The duration between epochs.
     * @param _genesis The genesis time to synchronize epochs with the FastBridgeReceiverOnGnosis.
     * @param _amb The address of the AMB contract on Ethereum
     */
    constructor(
        IFastBridgeReceiver _fastBridgeReceiver,
        uint256 _epochPeriod,
        uint256 _genesis,
        IAMB _amb
    ) FastBridgeSenderBase(_fastBridgeReceiver, _epochPeriod, _genesis) {
        amb = _amb;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (uint256) {
        // Safe Bridge message envelope
        bytes4 methodSelector = IAMB.requireToPassMessage.selector;
        // 4000000 is the max gas fee, set at a resonable level for deployment
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _receiver, _calldata, 4000000);
        uint256 withdrawalId = ARB_SYS.sendTxToL1(address(amb), safeMessageData);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }
}
