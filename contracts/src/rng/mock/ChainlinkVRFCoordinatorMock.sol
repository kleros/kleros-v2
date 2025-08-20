// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/// @title A mock for testing code that relies on VRFCoordinatorV2.
contract ChainlinkVRFCoordinatorV2Mock is IVRFCoordinatorV2Plus {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 nextRequestId = 1;
    mapping(uint256 requestID => VRFV2PlusClient.RandomWordsRequest request) requests;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );
    event RandomWordsFulfilled(uint256 indexed requestId, bool success);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    function fulfillRandomWords(uint256 _requestId, address _consumer, uint256[] memory _words) public {
        if (_consumer == address(0)) revert("zero address consumer");
        if (requests[_requestId].subId == 0) {
            revert("nonexistent request");
        }
        VRFV2PlusClient.RandomWordsRequest memory req = requests[_requestId];

        if (_words.length == 0) {
            _words = new uint256[](req.numWords);
            for (uint256 i = 0; i < req.numWords; i++) {
                _words[i] = uint256(keccak256(abi.encode(_requestId, i)));
            }
        } else if (_words.length != req.numWords) {
            revert InvalidRandomWords();
        }

        bytes4 FULFILL_RANDOM_WORDS_SELECTOR = bytes4(keccak256("rawFulfillRandomWords(uint256,uint256[])"));
        bytes memory callReq = abi.encodeWithSelector(FULFILL_RANDOM_WORDS_SELECTOR, _requestId, _words);
        delete (requests[_requestId]);
        (bool success, ) = _consumer.call{gas: req.callbackGasLimit}(callReq);
        emit RandomWordsFulfilled(_requestId, success);
    }

    function requestRandomWords(VRFV2PlusClient.RandomWordsRequest calldata req) external returns (uint256) {
        uint256 requestId = nextRequestId++;

        requests[requestId] = req;

        emit RandomWordsRequested(
            req.keyHash,
            requestId,
            req.subId,
            req.requestConfirmations,
            req.callbackGasLimit,
            req.numWords,
            msg.sender
        );
        return requestId;
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function fundSubscription(uint256, uint96) public pure {
        revert("not implemented");
    }

    function createSubscription() external pure returns (uint256) {
        revert("not implemented");
    }

    function fundSubscriptionWithNative(uint256) external payable {
        revert("not implemented");
    }

    function getActiveSubscriptionIds(uint256, uint256) external pure returns (uint256[] memory) {
        revert("not implemented");
    }

    function getSubscription(uint256) external pure returns (uint96, uint96, uint64, address, address[] memory) {
        revert("not implemented");
    }

    function cancelSubscription(uint256, address) external pure {
        revert("not implemented");
    }

    function addConsumer(uint256, address) external pure {
        revert("not implemented");
    }

    function removeConsumer(uint256, address) external pure {
        revert("not implemented");
    }

    function requestSubscriptionOwnerTransfer(uint256, address) external pure {
        revert("not implemented");
    }

    function acceptSubscriptionOwnerTransfer(uint256) external pure {
        revert("not implemented");
    }

    function pendingRequestExists(uint256) public pure returns (bool) {
        revert("not implemented");
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error InvalidRandomWords();
}
