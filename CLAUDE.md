# Claude Code Notes for kleros-v2

## Monorepo Structure

This is a Yarn workspaces monorepo with multiple packages:

- `contracts/` - Solidity smart contracts (Foundry + Hardhat)
- `web/` - Frontend application
- `kleros-sdk/` - SDK package
- `kleros-app/` - App package
- `subgraph/` - TheGraph subgraph definitions
- `bots/` - Automation bots
- `services/` - Backend services

Shared configs: `eslint-config/`, `prettier-config/`, `tsconfig/`

## Contracts Package

### Foundry Installation

```bash
# Install foundryup (if not already installed)
curl -L https://foundry.paradigm.xyz | bash

# Run foundryup to install/update forge, cast, anvil, chisel
export PATH="$PATH:/root/.foundry/bin" && foundryup
```

### Dependencies

```bash
# Install npm dependencies (required for OpenZeppelin, etc.)
yarn install

# Foundry submodules (forge-std, solmate) are auto-installed on first forge command
```

### Running Tests

```bash
# Run from repo root (foundry.toml is at root, contracts config in contracts/foundry.toml)
export PATH="$PATH:/root/.foundry/bin" && forge test
```

### Contracts Structure

- `contracts/src/` - Solidity source files
- `contracts/test/foundry/` - Foundry test files
- `contracts/foundry.toml` - Foundry configuration (Solc 0.8.30, Cancun EVM, via-ir enabled)
- `remappings.txt` - Import path remappings for both Foundry and Hardhat

### Contracts Known Issues

File names must match contract names exactly (Linux is case-sensitive):

- Contract `BlockHashRNG` must be in file `BlockHashRNG.sol`, not `BlockhashRNG.sol`

## Audit Context

This codebase contains fixes for the Certora security audit. Related PR: https://github.com/kleros/kleros-v2/pull/2209
