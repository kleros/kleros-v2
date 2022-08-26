# Kleros Court Data: Containers to replicate and decentralize data

Adapted from @geaxed PoH data container.

## Quick start

If you don't have a local Ethereum node, add a RPC to the docker-compose file.

```
git clone
cd
docker-compose build
docker-compose up -d
```

### In the box

1. Standard IPFS container which creates a local mount for data
2. Custom PoH container that awaits new events and then scrapes the latest hashes and submits it to IPFS.

## Contributions

Please visit [contribution.kleros.io](contributing.kleros.io.).
For any questions, please join the Kleros Discord or Telegram.

## Considerations

⚠️ Alpha version

- Not all data is included yet

⚠️ Full data coverage

- Currently this is serving as a proof of concept, no warranty or support provided at this stage.
