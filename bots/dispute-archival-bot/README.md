# dispute-archival-bot

Archives disputes from an archived KlerosCore contract.

DisputeArchive Contract : [arbitrum sepolia](https://sepolia.arbiscan.io/address/0x13713cf6D261704A07aB8a44d88CE5d795fdF99d) (For testing, archived the mainnet beta disputes on arbitrum sepolia)

### Archived data includes:

1. Populated dispute data from `kleros-sdk`
2. Evidences for the disputes (Un-filtered)
3. Dispute details from Subgraph. Subgraph here is the one that indexed the archived KlerosCore
4. Templates for the dispute. These are saved in case the dispute is broken, in which case populated dispute data will be never. Acts as a recovery.

### Notes:

1. Bot does not constantly monitor the archive core contract, it runs one time and archives any non archived disputes.
2. The subgraph query is limited at 1000 entities, for now beta will likely not cross 1000 disputes and 1000 evidences per dispute and 1000 draws per dispute.

:warning: Subgraph schema was changed between Neo/beta Kleros Core and the new stable versions. This bot queries the older subgraph with old schema for mainnet beta.

### Pending

1. Logic does not check for ongoing disputes yet, it archives regardless. During stable release, the disputes will all be closed, so should not be an issue.
2. Subgraph support pending
