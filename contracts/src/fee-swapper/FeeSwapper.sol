// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFeeSwapper.sol";
import "../gateway/interfaces/IForeignGateway.sol";

interface IAggregationRouterV5 {
    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
    }

    /// @notice Performs a swap, delegating all calls encoded in `data` to `executor`. See tests for usage examples
    /// https://docs.1inch.io/docs/aggregation-protocol/smart-contract/AggregationRouterV5#swap
    /// @notice GetQuote() can only be calculated off-chain using the API https://docs.1inch.io/docs/aggregation-protocol/api/quote-params/#
    /// @dev router keeps 1 wei of every token on the contract balance for gas optimisations reasons. This affects first swap of every token by leaving 1 wei on the contract.
    /// @param executor Aggregation executor that executes calls described in `data`
    /// @param desc Swap description
    /// @param data Encoded calls that `caller` should execute in between of swaps
    /// @return returnAmount Resulting token amount
    /// @return gasLeft Gas left
    function swap(
        address executor,
        SwapDescription calldata desc,
        bytes calldata data
    ) external returns (uint256 returnAmount, uint256 gasLeft);
}

contract FeeSwapper is IFeeSwapper {
    IERC20 public weth; // WETH address.
    IForeignGateway public gateway; // Foreign gateway on this chain to get arbitration cost.
    IAggregationRouterV5 public aggregationRouterV5; // 1inch router.
    address public executor; // Aggregation executor.
    address public governor = msg.sender; // Governor of the contract

    struct Request {
        address requester; // Contract that requested the swap.
        uint256 disputeID; // ID of the dispute in the requester contract.
        uint256 amount; // Amount of tokens to swap.
        uint256 returnAmount; // Amount of received WETH after swap.
        bool swapped; // True if the request is fulfilled.
        bytes extraData; // Extra data of the associated dispute.
    }

    Request[] public requests; // Array of requests.
    mapping(address => bool) public whitelisted; // Whitelisted addresses that are allowed to request swap.

    constructor(IERC20 _weth, IAggregationRouterV5 _aggregationRouterV5, address _executor) {
        weth = _weth;
        aggregationRouterV5 = _aggregationRouterV5;
        executor = _executor;
    }

    function changeGovernor(address _governor) external {
        require(msg.sender == governor, "Only governor allowed");
        governor = _governor;
    }

    function addWhitelist(address _sender, bool _allowed) external {
        require(msg.sender == governor, "Only governor allowed");
        whitelisted[_sender] = _allowed;
    }

    /**
     * @dev Requests swap and stores the info.
     * @param _disputeID External dispute ID.
     * @param _extraData Extra data of the dispute.
     * @return requestID ID of the request.
     */
    function requestSwap(uint256 _disputeID, bytes memory _extraData) external payable returns (uint256 requestID) {
        require(whitelisted[msg.sender], "Requester not whitelisted"); // Prevent request spam.
        requestID = requests.length;
        Request storage request = requests.push();
        request.requester = msg.sender;
        request.disputeID = _disputeID;
        request.amount = msg.value;
        request.extraData = _extraData;
    }

    /**
     * @dev Swaps native chain currency (msg.value) to WETH.
     * @param _requestID ID of the request.
     * @return returnAmount Amount of converted WETH.
     * @return fee Arbitration fee in WETH.
     */
    function swapToWETH(uint256 _requestID) public returns (uint256 returnAmount, uint256 fee) {
        Request storage request = requests[_requestID];
        require(!request.swapped, "Request already fulfilled");

        request.swapped = true;
        // TODO: fill in the struct properties and executorData.
        IAggregationRouterV5.SwapDescription memory desc;
        desc.dstToken = weth;
        desc.srcReceiver = payable(executor);
        desc.dstReceiver = payable(request.requester);
        desc.amount = request.amount;
        bytes memory executorData;
        (returnAmount, ) = aggregationRouterV5.swap(executor, desc, executorData);

        fee = IForeignGateway(msg.sender).arbitrationCost(request.extraData);
        require(returnAmount >= fee, "Not enough WETH for arbitration");

        request.returnAmount = returnAmount;
    }

    /**
     * @dev Performs swap for multiple requests.
     * @param _startIndex Start request index.
     * @param _iterations Number of iterations to go.
     */
    function batchSwap(uint256 _startIndex, uint256 _iterations) external {
        for (uint256 i = _startIndex; (i < requests.length) && (i < _startIndex + _iterations); i++) {
            swapToWETH(i);
        }
    }

    // TODO:
    // 1inch only allows to getQuoute off-chain.
    function getAmountOut(uint256 _amountIn) external view returns (uint256) {}

    function balanceWETH() external view returns (uint256) {
        return weth.balanceOf(address(this));
    }
}
