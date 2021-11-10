# Kleros version 2

## Deployed Addresses

See [contracts/README.md](contracts/README.md#deployed-addresses).

## Contributing

### Repo Structure

Each directory at the root of this repository contains code for each individual part that enables this integration:

- **`bots/`**: service to automate some steps of the flow which otherwise would required manual intervention from users.
  - **Notice:** while this is a centralized service, it exists only for convenience. Users can fulfill the role of the bots if they wish to.
- **`contracts/`**: Smart contracts to enable cross-chain arbitration for Realitio (Reality.eth). [Learn more](contracts/README.md).
- **`dynamic-script/`**: allows fetching the dynamic content for the arbitration, as described by [ERC-1497: Evidence Standard](https://github.com/ethereum/EIPs/issues/1497).
- **`evidence-display/`**: display interface that should be used to render the evidence for arbitrators, as described by [ERC-1497: Evidence Standard](https://github.com/ethereum/EIPs/issues/1497).
