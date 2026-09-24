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
        ShortReturnData // Returns less than 32 bytes.
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
        if (mode == Mode.BurnAllGas) {
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
