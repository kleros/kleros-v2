#!/usr/bin/env bash

SOURCE_DIR="src"

yarn dlx solidity-code-metrics \
    "$SOURCE_DIR"/arbitration/KlerosCore.sol \
    "$SOURCE_DIR"/arbitration/PolicyRegistry.sol \
    "$SOURCE_DIR"/arbitration/SortitionModule.sol \
    "$SOURCE_DIR"/arbitration/arbitrables/DisputeResolver.sol \
    "$SOURCE_DIR"/arbitration/DisputeTemplateRegistry.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/CentralizedKit.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/DisputeKitClassic.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/DisputeKitGated.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/DisputeKitGatedArgentinaConsumerProtection.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/DisputeKitGatedShutter.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/DisputeKitShutter.sol \
    "$SOURCE_DIR"/arbitration/dispute-kits/DisputeKitSybilResistant.sol \
    "$SOURCE_DIR"/arbitration/evidence/EvidenceModule.sol \
    "$SOURCE_DIR"/arbitration/interfaces/* \
    "$SOURCE_DIR"/governance/LeaderboardOffset.sol \
    "$SOURCE_DIR"/libraries/Constants.sol \
    "$SOURCE_DIR"/libraries/SortitionTrees.sol \
    "$SOURCE_DIR"/libraries/Safe* \
    "$SOURCE_DIR"/rng/RNGWithFallback.sol \
    "$SOURCE_DIR"/rng/ChainlinkRNG.sol \
    "$SOURCE_DIR"/rng/IRNG.sol \
    "$SOURCE_DIR"/token/SBT.sol \
sed '/^➤ YN/d' > audit/METRICS.md