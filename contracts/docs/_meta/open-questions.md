---
title: Open Questions Register
slug: _meta/open-questions
layer: null
category: reference
status: draft
version: 0.2.0
last_updated: 2026-04-17
authors:
  - jaybuidl
depends_on: []
implementation_status: not-applicable
open_questions: []
---

# Open Questions Register

Every `[OPEN QUESTION Q-<NNN>]` tag in a specification document has a matching entry in this register.

## Conventions

- **ID format**: `Q-<NNN>` — a flat, zero-padded three-digit sequence assigned globally across all documents. The next available number is allocated when a new question is registered; numbers are never reused.
- **Status values**:
  - `open` — unresolved.
  - `answered` — resolution recorded in the table below; the spec is updated to incorporate the answer, and the question status then moves to `answered`.
  - `deferred` — acknowledged but not being actively resolved (e.g. parked for a later protocol version, or decided to be out of scope for the register). Inline `[OPEN QUESTION Q-<NNN>]` tags in spec bodies MAY be removed once a question is deferred; the register row remains for history.
- **Never delete a question.** Status changes only.
- **Link from the spec.** Each `open` occurrence of `[OPEN QUESTION Q-<NNN>]` in a spec must resolve to a row here.
- **Dates and references.** `Raised` is the date the question was registered. `Resolved` is the date the status transitioned out of `open`, optionally suffixed with a commit short-hash or PR number.

## Register

| ID | Document | Question | Raised | Status | Owner | Resolved | Resolution |
|----|----------|----------|--------|--------|-------|----------|------------|
| Q-001 | [00-overview](../00-overview.md) | Top-level component diagram: keep Mermaid, or export from Excalidraw for Google Doc publication? | 2026-04-16 | deferred | jaybuidl | 2026-04-17 | Editorial/tooling choice; out of scope for the protocol question register. Revisit at the first full pass of Layer 1. Inline tag removed from `00-overview.md`. |
| Q-002 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Fork-token genesis basis: stake-snapshot pro-rata, or the yellow paper's per-fork coherence replay of earlier rounds? Decision needed; team discussion of the incentive trade-off. | 2026-06-14 | open | jaybuidl | | |
| Q-003 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Should the reserved option `0` (Invalid / Refuse-to-Arbitrate) be permitted in the forking round — as a winner, as a forkable minority option, and under tie semantics? Leaning yes. | 2026-06-14 | open | jaybuidl | | |
| Q-004 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Winner tie-break rule for the forking round. Leaning lowest option ID. | 2026-06-14 | open | jaybuidl | | |
| Q-005 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | PNK fate of a holder who voted a losing option but stays on the main fork (no forking-round penalty?). Confirm intended end state, including the interaction with earlier-round coherence penalties. | 2026-06-14 | open | jaybuidl | | |
| Q-006 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Destination of slashed stake: absorbed into the main-fork redistribution, or sent to the governor? | 2026-06-14 | open | jaybuidl | | |
| Q-007 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | `ForkSettlement` in-lined into `DisputeKitForking` or a separate composed contract? Refinement; leaning split for bytecode-limit and mint-authority isolation. | 2026-06-14 | open | jaybuidl | | |
| Q-008 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Should the forking round's duration be bounded, given the concurrent-`execute()` liveness cost of the stake freeze? | 2026-06-14 | open | jaybuidl | | |
| Q-009 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Ranked ballots (WoodSIRV) plus the optimistic off-chain fork-proposal verifier, restoring expressiveness, clone-independence (Prop. 5), and the strict ≥ T resistance bound (Prop. 6). Future work. | 2026-06-14 | open | jaybuidl | | |
| Q-010 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Strengthen the deterministic appeal-exhaustion trigger with a probabilistic element, so jurors cannot know which appeal is the last before a fork. Future work. | 2026-06-14 | open | jaybuidl | | |
| Q-011 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Bootstrapping a parallel arbitrator on a fork token — facilitated via a factory contract or user-friendly deployment scripts. Future work. | 2026-06-14 | open | jaybuidl | | |
| Q-012 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Fate of open disputes at fork time — recreation and re-resolution on minority forks. Future work / governance. | 2026-06-14 | open | jaybuidl | | |
| Q-013 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Arbitrables that cannot switch arbitrator will not follow a minority fork. Integration limitation; mitigation? | 2026-06-14 | open | jaybuidl | | |
| Q-014 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Unstaked PNK held by liquidity providers, market makers, or treasuries — may a minority fork mint to such entities 1:1? Per-fork policy. | 2026-06-14 | open | jaybuidl | | |
| Q-015 | [layer-1-core/07-forking](../layer-1-core/07-forking.md) | Forked-arbitrator genesis state — should a minority fork's parallel arbitrator recreate the triggering dispute pre-resolved to the fork's winning option? Future work; cross-references Q-011, Q-012. | 2026-06-14 | open | jaybuidl | | |
