// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {IArbitrableV2, IArbitratorV2} from "./interfaces/IArbitratorV2.sol";
import {IDisputeKit} from "./interfaces/IDisputeKit.sol";
import {ISortitionModule} from "./interfaces/ISortitionModule.sol";
import {SafeERC20, IERC20} from "../libraries/SafeERC20.sol";
import {Constants} from "../libraries/Constants.sol";
import {OnError} from "../libraries/Types.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {Initializable} from "../proxy/Initializable.sol";

contract ArbitratorDummy is IArbitratorV2 {
    event ArbitrableRegisteration(address indexed _arbitrable);

    uint256 public disputeID;

    constructor() {}

    function register() external {
        // Warning: could be abused by EOAs and non-arbitrable contracts.
        emit ArbitrableRegisteration(msg.sender);
    }

    function createDispute(uint256, bytes memory) external payable override returns (uint256) {
        return ++disputeID;
    }

    function createDispute(uint256, bytes calldata, IERC20, uint256) external override returns (uint256) {
        return ++disputeID;
    }

    function executeRuling(uint256) external pure {
        revert NotImplemented();
    }

    function arbitrationCost(bytes memory) public pure override returns (uint256) {
        return 0;
    }

    function arbitrationCost(bytes calldata, IERC20) public pure override returns (uint256) {
        return 0;
    }

    function currentRuling(uint256) external pure override returns (uint256, bool, bool) {
        revert NotImplemented();
    }

    error NotImplemented();
}
