---
title: Kleros v2 Protocol Specifications
slug: README
layer: null
category: overview
status: draft
version: 0.2.0
last_updated: 2026-04-17
authors:
  - jaybuidl
depends_on: []
implementation_status: not-applicable
open_questions: []
---

# Kleros v2 Protocol Specifications

Protocol-level specifications for the Kleros v2 smart contracts.

These documents describe **what the protocol is expected to do and guarantee** — the intent. They are not a line-by-line description of the current implementation. Where the deployed contracts diverge from what is specified here, that divergence is a bug in either the code or the spec and must be tracked.

## Start here

1. [00-overview.md](00-overview.md) — protocol goals, actors, trust model.
2. [_meta/conventions.md](_meta/conventions.md) — how these documents are written and structured. **Read this before editing any specification.**

## Structure

| Path | Scope | Spec | Impl |
|------|-------|------|------|
| [00-overview.md](00-overview.md) | Protocol goals, actors, trust model | draft | partial |
| [layer-1-core/](layer-1-core/) | Core protocol (arbitrator, sortition, dispute kits, courts, on-chain metadata, integration surface) | draft | live |
| [layer-2-cross-chain/](layer-2-cross-chain/) | Cross-chain dispute relaying (Hashi + Vea-as-fallback) | placeholder | planned |
| [layer-3-merge/](layer-3-merge/) | Kleros v1 → v2 transparent merge on Ethereum and Gnosis | placeholder | planned |
| [_meta/](_meta/) | Conventions, glossary, open-questions register | draft | not-applicable |

## Status dashboard

`Spec` tracks the lifecycle of the document; `Impl` tracks the state of what the document describes in deployed code. See [_meta/conventions.md](_meta/conventions.md#status-lifecycle).

| Document | Layer | Spec | Impl |
|----------|-------|------|------|
| [00-overview](00-overview.md) | — | draft | partial |
| [_meta/conventions](_meta/conventions.md) | — | draft | not-applicable |
| [_meta/glossary](_meta/glossary.md) | — | draft | not-applicable |
| [_meta/open-questions](_meta/open-questions.md) | — | draft | not-applicable |
| [CHANGELOG](CHANGELOG.md) | — | draft | not-applicable |
| [layer-1-core/00-overview](layer-1-core/00-overview.md) | 1 | draft | live |
| [layer-1-core/01-arbitrator](layer-1-core/01-arbitrator.md) | 1 | placeholder | live |
| [layer-1-core/02-sortition](layer-1-core/02-sortition.md) | 1 | placeholder | live |
| [layer-1-core/03-dispute-kits](layer-1-core/03-dispute-kits.md) | 1 | placeholder | live |
| [layer-1-core/04-courts](layer-1-core/04-courts.md) | 1 | placeholder | live |
| [layer-1-core/05-integration-surface](layer-1-core/05-integration-surface.md) | 1 | placeholder | live |
| [layer-1-core/06-onchain-metadata](layer-1-core/06-onchain-metadata.md) | 1 | placeholder | live |
| [layer-2-cross-chain/README](layer-2-cross-chain/README.md) | 2 | placeholder | planned |
| [layer-3-merge/README](layer-3-merge/README.md) | 3 | placeholder | planned |
