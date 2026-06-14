---
title: Layer 1 — Core Protocol Overview
slug: layer-1-core/00-overview
layer: 1
category: overview
status: draft
version: 0.1.0
last_updated: 2026-04-17
authors:
  - jaybuidl
depends_on:
  - 00-overview
implementation_status: live
open_questions: []
---

# Layer 1 — Core Protocol Overview

Entry point for the Layer 1 specifications. Layer 1 covers the core protocol deployed on the home chain: the arbitrator, sortition, dispute kits, courts, the integration surface exposed to arbitrable contracts, and on-chain metadata.

## Components

| # | Component | Specification | Covers |
|---|-----------|---------------|--------|
| 01 | Arbitrator | [01-arbitrator.md](01-arbitrator.md) | `KlerosCore`, `IArbitratorV2` |
| 02 | Sortition | [02-sortition.md](02-sortition.md) | `SortitionModule`, `ISortitionModule`, `SortitionTrees` library |
| 03 | Dispute kits | [03-dispute-kits.md](03-dispute-kits.md) | `IDisputeKit`, `DisputeKitClassic` and variants |
| 04 | Courts | [04-courts.md](04-courts.md) | Court tree, parameters, eligibility |
| 05 | Integration surface | [05-integration-surface.md](05-integration-surface.md) | `IArbitratorV2`, `IArbitrableV2`, ERC-792 / ERC-1497 mapping |
| 06 | On-chain metadata | [06-onchain-metadata.md](06-onchain-metadata.md) | Policy, Evidence, Dispute Template registries and JSON formats |

## Reading order

For readers unfamiliar with Kleros, read in listed order (01 → 06). Each component specification declares its `depends_on` in frontmatter; follow those if jumping in mid-list.

## Related documents

- [00-overview.md](../00-overview.md) — protocol-wide goals, actors, trust and adversary models.
- [_meta/conventions.md](../_meta/conventions.md) — how these specifications are structured.
- [_meta/glossary.md](../_meta/glossary.md) — canonical term definitions.
