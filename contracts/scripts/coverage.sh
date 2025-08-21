#!/usr/bin/env bash

set -e # exit on error

rm -rf coverage
mkdir -p coverage

# Generate the Forge coverage report
forge clean
if [ "$CI" != "true" ]; then
  echo "Building contracts with Forge..."
  forge build
  echo "Running Forge coverage..."
  forge coverage --report summary --report lcov --report-file coverage/lcov-forge.info
  echo "Forge coverage report generated"
else 
  # FIXME: Temporarily workaround a CI issue
  touch coverage/lcov-forge.info
fi

# Generate the Hardhat coverage report
yarn clean
echo "Building contracts with Hardhat..."
export VIA_IR=false
yarn build
echo "Running Hardhat coverage..."
yarn hardhat coverage --solcoverjs ./.solcover.js --temp artifacts --show-stack-traces --testfiles "test/**/*.ts"
echo "Hardhat coverage report generated"
mv coverage/lcov.info coverage/lcov-hardhat.info

# Make the Hardhat report paths relative for consistency with Forge coverage report
sed -i -e 's/\/.*\/kleros-v2\/contracts\///g' coverage/lcov-hardhat.info

# Merge the two reports
lcov \
  --ignore-errors format \
  --ignore-errors inconsistent \
  --ignore-errors empty \
  --rc max_message_count=3 \
  --rc derive_function_end_line=0 \
  --rc branch_coverage=1 \
  --add-tracefile coverage/lcov-hardhat.info \
  --add-tracefile coverage/lcov-forge.info \
  --output-file coverage/merged-lcov.info

# Filter out unnecessary contracts from the report
lcov \
  --ignore-errors format \
  --ignore-errors inconsistent \
  --ignore-errors empty \
  --ignore-errors unused \
  --rc max_message_count=3 \
  --rc branch_coverage=1 \
  --rc derive_function_end_line=0 \
  --remove coverage/merged-lcov.info \
  --output-file coverage/filtered-lcov.info \
  "../node_modules" "src/test" "src/token" "src/kleros-v1" "src/proxy/mock" "src/gateway/mock" "src/rng/mock"

# Open more granular breakdown in browser
if [ "$CI" != "true" ]; then
  # Generate the HTML report
  genhtml coverage/filtered-lcov.info \
    --ignore-errors format \
    --ignore-errors inconsistent \
    --ignore-errors empty \
    --ignore-errors category \
    --rc branch_coverage=1 \
    --rc max_message_count=3 \
    -o coverage
  open coverage/index.html
fi
