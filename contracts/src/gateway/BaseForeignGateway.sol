// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrable.sol";
import "../bridge/IL1Bridge.sol";

import "./interfaces/IHomeGateway.sol";
import "./interfaces/IForeignGateway.sol";

abstract contract BaseForeignGateway is IL1Bridge, IForeignGateway {
    // @dev Note the disputeID needs to start from one as
    // the KlerosV1 proxy governor depends on this implementation.
    uint256 internal localDisputeID = 1;

    // For now this is just a constant, but we'd probably need to
    // implement the same arbitrationCost calculation code we'll have
    // in the V2 court.
    uint256 internal internalArbitrationCost;

    struct DisputeData {
        uint256 id;
        address arbitrable;
    }
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => DisputeData) public disputeHashtoDisputeData;

    IHomeGateway public homeGateway;
    uint256 public chainID;

    modifier onlyFromL2() {
        onlyAuthorized();
        _;
    }

    constructor(uint256 _arbitrationCost, IHomeGateway _homeGateway) {
        internalArbitrationCost = _arbitrationCost;
        homeGateway = _homeGateway;

        uint256 id;
        assembly {
            id := chainid()
        }
        chainID = id;
    }

    function createDispute(uint256 _choices, bytes calldata _extraData) external payable returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Not paid enough for arbitration");

        disputeID = localDisputeID++;
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                chainID,
                blockhash(block.number - 1),
                "createDispute",
                disputeID,
                arbitrationCost(_extraData),
                _extraData,
                msg.sender
            )
        );
        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoDisputeData[disputeHash] = DisputeData({id: disputeID, arbitrable: msg.sender});

        bytes4 methodSelector = IHomeGateway.relayCreateDispute.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, disputeHash, _choices, _extraData);

        // We only pay for the submissionPrice gas cost
        // which is minimum gas cost required for submitting a
        // arbitrum retryable ticket to the retry buffer for
        // bridge to L2.
        // For immediate inclusion a user/bot needs to pay (GasPrice x MaxGas)
        // with the associated ticketId that is emitted by this function
        // after the ticket is successfully submitted.
        // For more details, see:
        // https://developer.offchainlabs.com/docs/l1_l2_messages#retryable-tickets-contract-api
        //
        // We do NOT forward the arbitrationCost ETH funds to the HomeGateway yet,
        // only the calldata.
        sendCrossDomainMessage(data, 0, 0);

        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    function arbitrationCost(bytes calldata _extraData) public view returns (uint256 cost) {
        // Calculate the size of calldata that will be passed to the L2 bridge
        // as that is a factor for the bridging cost.
        // Calldata size of relayCreateDispute:
        // relayCreateDispute methodId +
        //      (createDispute methodId + bytes32 disputeHash + uint256 _choices + bytes _extraData)
        //   4      +      4            +   32                +   32             + dynamic
        uint256 calldatasize = 82 + _extraData.length;

        uint256 bridgeCost = getSubmissionPrice(calldatasize);
        return bridgeCost + internalArbitrationCost;
    }

    /**
     * Relay the rule call from the home gateway to the arbitrable.
     */
    function relayRule(bytes32 _disputeHash, uint256 _ruling) external onlyFromL2 {
        DisputeData memory dispute = disputeHashtoDisputeData[_disputeHash];

        IArbitrable arbitrable = IArbitrable(dispute.arbitrable);
        arbitrable.rule(dispute.id, _ruling);
    }

    function foreignDisputeHashToID(bytes32 _disputeHash) external view returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
    }

    function disputeID(uint256 _foreignDisputeID) external view returns (uint256) {
        bytes32 disputeHash = disputeIDtoHash[_foreignDisputeID];
        require(disputeHash != 0, "Dispute does not exist");

        return homeGateway.homeDisputeHashToID(disputeHash);
    }

    function homeChainID(uint256 _disputeID) external view returns (uint256) {
        return homeGateway.chainID();
    }

    function homeBridge(uint256 _disputeID) external view returns (address) {
        return address(homeGateway);
    }
}
