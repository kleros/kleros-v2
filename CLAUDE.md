# Claude Code Notes for kleros-v2

Work style: telegraph; noun-phrases ok; drop filler/grammar; min tokens

## Monorepo Structure

Yarn workspaces monorepo:

- `contracts/` - Solidity (Foundry + Hardhat)
- `web/` - Frontend
- `kleros-sdk/` - SDK
- `kleros-app/` - App
- `subgraph/` - TheGraph definitions
- `bots/` - Automation
- `services/` - Backend

Shared: `eslint-config/`, `prettier-config/`, `tsconfig/`

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
- `contracts/foundry.toml` - Foundry config (Solc 0.8.30, Cancun EVM, via-ir enabled)
- `remappings.txt` - Import path remappings (Foundry + Hardhat)

### Contracts Known Issues

File names must match contract names exactly (Linux case-sensitive):

- `BlockHashRNG` contract → `BlockHashRNG.sol`, not `BlockhashRNG.sol`

### Coding Style

- Function params: `_` prefix, no suffix
- Internal functions: `_` prefix, no `Internal` suffix
- Upgradeable `version`: define in derived only, not base: `string public constant override version = "0.0.1";`

## Audit Context

Certora security audit fixes. PR: https://github.com/kleros/kleros-v2/pull/2209
