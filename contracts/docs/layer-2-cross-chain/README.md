---
title: Layer 2 — Cross-chain Disputes
slug: layer-2-cross-chain/README
layer: 2
category: overview
status: placeholder
version: 0.2.0
last_updated: 2026-04-17
authors:
  - jaybuidl
depends_on:
  - 00-overview
implementation_status: planned
open_questions: []
---

# Layer 2 — Cross-chain Disputes

**Placeholder.** Full specification is deferred until Layer 1 component specifications reach `review` and the Hashi + Vea integration plan is confirmed with the Kleros team.

## Scope

Layer 2 specifies how arbitrable contracts deployed on a foreign chain request arbitration from `KlerosCore` on the home chain, and how rulings are relayed back. Contracts: `ForeignGateway` (foreign chain) and `HomeGateway` (home chain), in `contracts/src/gateway/`. Target bridging transport: Hashi with Vea configured as a fallback oracle. The integration surface exposed by `ForeignGateway` MUST be the same `IArbitratorV2` used by Layer 1, so Layer 1 arbitrables can be deployed behind a gateway without change.

## Unblock criteria

Drafting begins when: (a) Layer 1 core specs reach `review`, and (b) the Kleros team confirms the bridging stack (Hashi primary, Vea fallback) and associated challenge/grace-period parameters.

## Key design questions (to be opened when unblocked)

- Cross-chain dispute identifier derivation — binding chainId, parameters, and block state to prevent reorg-based pre-resolution.
- Liveness guarantees under single-bridge failure; fallback activation semantics and timing.
- Evidence and meta-evidence event aggregation across chains for UI consumption.

## Related documents

- [00-overview.md](../00-overview.md)
- [layer-3-merge/README.md](../layer-3-merge/README.md)
