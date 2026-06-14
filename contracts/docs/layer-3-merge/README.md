---
title: Layer 3 — v1 → v2 Merge Phase
slug: layer-3-merge/README
layer: 3
category: overview
status: placeholder
version: 0.2.0
last_updated: 2026-04-17
authors:
  - jaybuidl
depends_on:
  - 00-overview
  - layer-2-cross-chain/README
implementation_status: planned
open_questions: []
---

# Layer 3 — v1 → v2 Merge Phase

**Placeholder.** Full specification is deferred until Layer 1 and Layer 2 reach `review`. Layer 3 has a hard dependency on Layer 2.

## Scope

Layer 3 specifies how existing Kleros v1 dispute resolution is transparently migrated to Kleros v2 on the two chains where v1 is live:

| Chain | v1 contract | v2 relay contract |
|-------|-------------|-------------------|
| Ethereum mainnet | `KlerosLiquid` | `KlerosLiquidToV2Governor` |
| Gnosis chain | `xKlerosLiquid` | `xKlerosLiquidV2` |

**Polygon is explicitly out of scope** — v1 was never deployed there despite earlier plans.

The merge MUST be transparent: existing arbitrables and jurors see continuity of service without code changes, while dispute resolution is executed by v2 via the Layer 2 relays.

## Unblock criteria

Drafting begins when Layer 1 reaches `review` and Layer 2 has a placeholder message-flow specification sufficient to reference in migration semantics.

## Key design questions (to be opened when unblocked)

- State continuity for juror stakes, locked PNK, and in-flight v1 disputes at the switchover point.
- Transition period semantics: v1 dispute acceptance, evidence period extension, and ruling delivery while jurors migrate stake to v2.
- Governor-side responsibilities: fee collection on v2, ruling execution back onto v1.

## Related documents

- [00-overview.md](../00-overview.md)
- [layer-2-cross-chain/README.md](../layer-2-cross-chain/README.md)
