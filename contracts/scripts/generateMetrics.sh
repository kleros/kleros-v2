#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SOURCE_DIR="src"

yarn dlx solidity-code-metrics \
    "$SOURCE_DIR"/arbitration/KlerosCore* \
    "$SOURCE_DIR"/arbitration/PolicyRegistry.sol \
    "$SOURCE_DIR"/arbitration/SortitionModule* \
    "$SOURCE_DIR"/arbitration/arbitrables/DisputeResolver.sol \
    "$SOURCE_DIR"/arbitration/DisputeTemplateRegistry.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/* \
    "$SOURCE_DIR"/arbitration/evidence/EvidenceModule.sol \
    "$SOURCE_DIR"/arbitration/interfaces/* \
    "$SOURCE_DIR"/libraries/Constants.sol \
    "$SOURCE_DIR"/libraries/SortitionTrees.sol \
    "$SOURCE_DIR"/libraries/Safe* \
    "$SOURCE_DIR"/rng/RNGWithFallback.sol \
    "$SOURCE_DIR"/rng/ChainlinkRNG.sol \
    "$SOURCE_DIR"/rng/IRNG.sol \
    "$SOURCE_DIR"/proxy/UUPSProx* \
    "$SOURCE_DIR"/proxy/Initializable.sol \
--html >METRICS.html
