# Adding a New Dispute Kit

> NOTE: Also use this file as a checklist for new DK addition PRs

## File Structure

```
dispute-kits/
├── disputeKits.ts                 # DisputeKits enum (on-chain IDs)
├── types.ts                       # DisputeKitConfig, Features, Group
├── registry.ts                    # DISPUTE_KIT_REGISTRY — single source of truth
├── disputeFeature.ts              # Feature selection utils
├── prepareArbitratorExtradata.ts  # Creation data types + encoders
└── index.ts                       # Barrel exports
```

## Steps

### 1. Enum — `disputeKits.ts`

Add a value matching the **on-chain dispute kit ID**:

```ts
export enum DisputeKits {
  // ...
  YourNewKit = 7,
}
```

TypeScript will now error everywhere until you handle the new kit.

### 2. Registry — `registry.ts`

Add the entry. Reuse existing components where possible:

```ts
[DisputeKits.YourNewKit]: {
  id: DisputeKits.YourNewKit,
  displayName: "Your New Kit",
  address: disputeKitYourNewKitAddress[chainId],
  OverviewExtraInfo: undefined,
  VotingComponent: ClassicVotingComponent,
  AppealComponent: ClassicAppealComponent,
  disputeKitAbi: disputeKitYourNewKitAbi,
  hasAutomaticVoteReveal: false,
  featureSets: [[Features.ClassicVote, Features.YourNewFeature]],
},
```

### 3. Features (if new) — `types.ts` + `disputeFeature.ts`

Add to `Features` enum in `types.ts`, then to the relevant group in `disputeFeature.ts`.
Create a UI component in `components/DisputeFeatures/Features/` and register it in `Features/index.tsx`.

### 4. Initial feature selection — `disputeFeature.ts`

Add a case in `resolveInitialFeatureSet()`. The exhaustive switch will error if you skip this.

### 5. Creation data (if any) — `prepareArbitratorExtradata.ts`

- Add type to `DisputeKitDataMap` (`AssertAllKits` errors if missing)
- Add encoder to `DisputeKitDataEncoder` (or `undefined` if no additional extra data)
- **MAKE SURE TO NOT LEAVE IT `undefined` IN CASE THE KIT REQUIRES ADDITIONAL EXTRADATA.** Define the Encoder accordingly in ./prepareArbitratorExtradata, along with an appropriate test for it.

### 6. Builders — `actions/{commit,reveal,vote,fundAppeal}/builders/`

Each has a `Record<DisputeKits, Builder>` map — TypeScript errors for the missing key. Reuse an existing builder if the logic matches.

### 7. Deployment filtering (if needed) — `disputeFeature.ts`

Update `getDisputeKitsForDeployment()` to exclude the kit on specific deployments.

### 8. Subgraph

Add a data source block in `subgraph/core/subgraph.template.yaml`. This is separate from the web registry.

## What TypeScript Catches

Adding a new enum value triggers compile errors in:

- `DISPUTE_KIT_REGISTRY` — missing entry
- `DisputeKitDataMap` — missing key
- `DisputeKitDataEncoder` — missing key
- `resolveInitialFeatureSet` — unhandled case
- All 4 builder maps in `actions/` — missing key

Fix all of these and the kit is integrated.

## Gotchas

- **Enum value = on-chain ID.**
- **`featureSets[0]` is the default.** For multi-set kits, add selection logic in `resolveInitialFeatureSet`.
- **Builders are intentionally separate** from the registry. They own their own ABI + address for testability.
- **Subgraph queries use `ClassicRound` fragments.** If your kit has a different round structure, you'll need new queries.
- **Dispute Kit Encoder** These are required by the DK to handle the encoding of extradata on top of the classic arbitrator extradata. MAKE SURE TO NOT LEAVE IT `undefined` IN CASE THE KIT REQUIRES ADDITIONAL EXTRADATA. Define the Encoder accordingly in ./prepareArbitratorExtradata, along with an appropriate test for it.
