# Kleros Court V2 Evidence: Containers to replicate and decentralize data

## Quick start
If you don't have a local RPC node, add a RPC to the docker-compose file.
```
git clone git@github.com:kleros/kleros-v2.git
cd bot-pinner/
docker-compose build
docker-compose up -d
```

### In the box
1. Standard IPFS container which creates a local mount for data
2. Evidence container that awaits new events and then scrapes the latest hashes and submits it to IPFS.


## Contributions
Please visit [contribution.kleros.io](contributing.kleros.io.).
For any questions, please join the Kleros Discord or Telegram.
