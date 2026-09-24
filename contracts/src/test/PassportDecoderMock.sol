// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IPassportDecoder} from "../arbitration/dispute-kits/DisputeKitGatedPerCourt.sol";

/// @title PassportDecoderMock
/// Mimics the Human Passport decoder on Arbitrum One: `getScore()` reverts for a user without a score attestation
/// or with an expired one. Also simulates a misbehaving decoder to use in the tests.
/// Deployed on V2 testnet, where Human Passport is not available: anyone can set any score.
contract PassportDecoderMock is IPassportDecoder {
    enum Mode {
        Normal,
        BurnAllGas, // Consumes all the gas forwarded.
        ShortReturnData, // Returns less than 32 bytes.
        GasLeft // Returns the gas left on entry as the score, to check how much gas the caller forwarded.
    }

    struct Score {
        uint256 score;
        bool attested;
        bool expired;
    }

    mapping(address user => Score) public scores;
    Mode public mode;

    error AttestationNotFound();
    error AttestationExpired(uint64 expirationTime);

    function setScore(address _user, uint256 _score) external {
        scores[_user] = Score({score: _score, attested: true, expired: false});
    }

    function setExpired(address _user) external {
        scores[_user].expired = true;
    }

    function removeScore(address _user) external {
        delete scores[_user];
    }

    function setMode(Mode _mode) external {
        mode = _mode;
    }

    function getScore(address _user) external view override returns (uint256) {
        uint256 gasAtEntry = gasleft(); // Before any storage read, so that it doesn't depend on warm/cold accesses.
        if (mode == Mode.GasLeft) {
            return gasAtEntry;
        } else if (mode == Mode.BurnAllGas) {
            while (true) {}
        } else if (mode == Mode.ShortReturnData) {
            assembly {
                mstore(0, 1)
                return(0, 16)
            }
        }
        Score storage score = scores[_user];
        if (!score.attested) revert AttestationNotFound();
        if (score.expired) revert AttestationExpired(uint64(block.timestamp - 1));
        return score.score;
    }
}

/// @title DelegateProxyMock
/// Minimal proxy delegating every call to an implementation, with the implementation's reverts bubbled up.
contract DelegateProxyMock {
    address public immutable implementation;

    constructor(address _implementation) {
        implementation = _implementation;
    }

    fallback() external {
        address impl = implementation;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            if iszero(success) {
                revert(0, returndatasize())
            }
            return(0, returndatasize())
        }
    }
}

/// @title PassportResolverMock
/// Stands for the GitcoinResolver implementation, the deepest frame of the Human Passport decoder on Arbitrum One:
/// decoder proxy -> (delegatecall) decoder implementation -> resolver proxy -> (delegatecall) resolver implementation.
/// To be deployed behind a DelegateProxyMock, see PassportDecoderImplMock.
contract PassportResolverMock {
    mapping(address user => uint256) public scores;
    uint256 public workIterations; // Makes `getCachedScore()` heavier, e.g. to simulate an upgrade of the decoder.

    function setScore(address _user, uint256 _score) external {
        scores[_user] = _score;
    }

    function setWorkIterations(uint256 _workIterations) external {
        workIterations = _workIterations;
    }

    function getCachedScore(address _user) external view returns (uint256) {
        uint256 iterations = workIterations;
        bytes32 acc;
        for (uint256 i = 0; i < iterations; i++) {
            assembly {
                mstore(0, acc)
                mstore(0x20, i)
                acc := keccak256(0, 0x40)
            }
        }
        if (acc == bytes32(uint256(1))) revert(); // Keeps the work from being optimized away.
        return scores[_user];
    }
}

/// @title PassportDecoderImplMock
/// Stands for the GitcoinPassportDecoder implementation: reads the score from the resolver, reverts without one.
/// To be deployed behind a DelegateProxyMock, with `_resolver` a DelegateProxyMock of a PassportResolverMock.
contract PassportDecoderImplMock is IPassportDecoder {
    PassportResolverMock public immutable resolver;

    error AttestationNotFound();

    constructor(PassportResolverMock _resolver) {
        resolver = _resolver;
    }

    function getScore(address _user) external view override returns (uint256 score) {
        score = resolver.getCachedScore(_user);
        if (score == 0) revert AttestationNotFound();
    }
}
