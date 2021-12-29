// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IArbSys.sol";
import "./AddressAliasHelper.sol";

contract L2Bridge {
    address public l1Target;
    IArbSys constant arbsys = IArbSys(address(100));

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    constructor(address _l1Target) {
        l1Target = _l1Target;
    }

    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @param _calldata The L1 encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(bytes memory _calldata) external returns (uint256) {
        uint256 withdrawalId = arbsys.sendTxToL1(l1Target, _calldata);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }

    function onlyAuthorized(address _sender) external {
        require(_sender == AddressAliasHelper.applyL1ToL2Alias(l1Target), "Only L1 target");
    }
}
