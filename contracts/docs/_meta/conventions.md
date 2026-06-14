---
title: Specification Conventions
slug: _meta/conventions
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

# Specification Conventions

Rules for writing, structuring, and maintaining the Kleros v2 specification documents. Read this before editing any specification.

## Scope of the specifications

These documents describe the **intent and expected behavior** of the protocol. They are:

- **Authoritative** on what the protocol should do, what it guarantees, and what it does not guarantee.
- **Not** a reference manual for the current implementation. Implementation details appear only when they are load-bearing for correctness or observable behavior.

When specification and implementation disagree:

- If the implementation is intentional, the specification is wrong — fix the spec.
- If the implementation is unintentional, the implementation is the bug — fix the code.
- If it is unclear which, record the divergence in [open-questions.md](open-questions.md) as an `open` question.

## Document structure

### Specification documents (`category: specification`)

Every component specification follows this skeleton. Sections may be omitted if empty, but their order is fixed.

```
---
<frontmatter>
---

# <Document title>

## Overview
## Guarantees
## Non-guarantees
## Actors and permissions
## Behavior
  ### <per operation>
## Invariants
## Error conditions
## Events
## Traceability
## Verification
## Security considerations
## Related documents
```

Notes:

- `Overview` is a single paragraph answering "what does this document specify?"
- `Guarantees` and `Non-guarantees` are complementary. Being explicit about what the protocol does **not** guarantee is as important as what it does.
- `Behavior` is organized per-operation (e.g. `createDispute`, `draw`, `execute`), not per internal function.
- `Invariants` are system properties that hold at all times between transactions.
- `Error conditions` are named failure modes, not a dump of revert strings.
- `Traceability` maps each guarantee and invariant back to its implementation in code. See [Traceability](#traceability).
- `Verification` maps each invariant to the Foundry test that verifies it. See [Verification](#verification).
- **Open questions are not a section.** They are tracked in three places only: (1) inline `[OPEN QUESTION Q-<NNN>]` tags at the point of doubt, (2) the `open_questions` list in frontmatter, (3) the central register in [`_meta/open-questions.md`](open-questions.md). Do not add an "Open questions" section to documents — it would duplicate the register.

### Overview documents (`category: overview`)

Overview documents (e.g. `00-overview.md`, layer-level `00-overview.md`, this conventions file) are **exempt from the specification skeleton**. They typically include some subset of: Scope, Goals, Actors, Trust model, Adversary model, Constraints, Architecture, Navigation, Related documents. Order and selection are at author discretion, with the constraint that any normative statement still uses RFC 2119 keywords.

### Reference and rationale documents

`category: reference` (glossaries, registers) and `category: rationale` (design notes) have no prescribed skeleton.

## Frontmatter schema

Every document begins with YAML frontmatter. The schema below is the complete list — do not add keys outside this list.

```yaml
---
# ─── Identity ─────────────────────────────────
title: <human-readable title>
slug: <relative path from contracts/docs/, without extension>
layer: <1 | 2 | 3 | null>          # null for meta / cross-cutting
category: specification | overview | reference | rationale
status: draft | review | stable | superseded | planned | placeholder
version: <semver for this document>
last_updated: <YYYY-MM-DD>
authors:
  - <handle>

# ─── Relationships ────────────────────────────
depends_on:                          # hard prerequisites — read first
  - <slug>

# ─── Tracking ─────────────────────────────────
implementation_status: live | partial | planned | deprecated | not-applicable
open_questions:
  - Q-<NNN>
---
```

### Field semantics

| Field | Notes |
|-------|-------|
| `slug` | Must match the file's relative path (without extension). Used for cross-references. |
| `layer` | `1`=core, `2`=cross-chain, `3`=merge, `null` for meta/overview. |
| `category` | `specification` binds the doc to the full skeleton; others are exempt. |
| `status` | Lifecycle of the **document**, not the protocol. See [Status lifecycle](#status-lifecycle). |
| `version` | Semver for the document. Independent of protocol version. |
| `last_updated` | ISO date of the latest edit (any edit). |
| `depends_on` | Slugs of documents the reader must understand first. Empty list if none. |
| `implementation_status` | State of what this document describes in the deployed code. |
| `open_questions` | IDs (`Q-<NNN>`) of questions referenced inline in the body. |

If a document needs to list the contracts or interfaces it covers, put that in a prose section in the body (e.g. `## Covers`) — not in frontmatter. Keeping `covers` out of frontmatter prevents silent rot when files move.

## Normative IDs

Each **guarantee** in a specification's `Guarantees` section is assigned an ID `G-<N>`, numbered per-document starting at 1. Each **invariant** in `Invariants` is assigned `INV-<N>`, similarly numbered. IDs are never reused within a document: when a guarantee or invariant is removed, its ID is retired, not reassigned.

These IDs are referenced from the `Traceability` and `Verification` tables and from other documents that need to cite a specific guarantee.

Format in the body:

```markdown
## Guarantees

- **G-1** — The arbitrator MUST deliver a ruling to an arbitrable exactly once per dispute.
- **G-2** — Parameter changes MUST only be callable by the governor.

## Invariants

- **INV-1** — A juror's locked PNK never exceeds their staked PNK.
- **INV-2** — The ruling returned by `currentRuling()` is stable once `Period.execution` is reached.
```

## Traceability

The `Traceability` section maps each guarantee and invariant to its implementation in code. Columns:

- **ID**: `G-<N>` or `INV-<N>`.
- **Statement**: one-line restatement.
- **Implementation**: `contract:function:line`, using paths relative to repo root.

Example:

```markdown
## Traceability

| ID | Statement | Implementation |
|----|-----------|----------------|
| G-1 | Ruling delivered exactly once | `contracts/src/arbitration/KlerosCore.sol:execute:L812` |
| G-2 | Governor-only parameter changes | `contracts/src/arbitration/KlerosCore.sol:changeGovernor:L223` |
| INV-1 | Locked PNK ≤ staked PNK | `contracts/src/arbitration/SortitionModule.sol:_setStake:L480` |
```

Line numbers are best-effort snapshots; they drift with code changes. Keep them current when updating the spec after an implementation change.

## Verification

The `Verification` section maps each invariant (and optionally each guarantee) to the Foundry test that verifies it. Columns:

- **ID**: `G-<N>` or `INV-<N>`.
- **Test**: `<file>.t.sol::<testFn>`, path relative to `contracts/test/foundry/`.

Example:

```markdown
## Verification

| ID | Test |
|----|------|
| INV-1 | `KlerosCore_Staking.t.sol::testLockedNeverExceedsStake` |
| INV-2 | `KlerosCore_Execution.t.sol::testRulingStableAfterExecution` |
| G-1 | `KlerosCore_Execution.t.sol::testRuleCalledExactlyOnce` |
```

Invariants SHOULD appear in this table when a verifying test exists. Missing rows signal verification gaps worth tracking.

## Style rules

- **Intent-first.** Every section leads with *what* and *why* before *how*.
- **No invention.** If a design decision is unknown, mark it with `[OPEN QUESTION Q-<NNN>]` and register it in [open-questions.md](open-questions.md). Do not guess.
- **Define once, link elsewhere.** Every concept has a canonical definition (usually in [glossary.md](glossary.md)). Other documents link rather than redefining.
- **Name errors.** Error conditions go in a dedicated table, not scattered across prose.
- **RFC 2119 keywords are always uppercase.** `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY`. Bolding is optional but must be consistent within a document.
- **Separate normative from informative.** Normative statements use RFC 2119 keywords. Informative asides are clearly marked as notes or rationale (e.g. block quotes, "Note:" prefix).
- **No feature flags in prose.** If something is optional or environment-specific, say so explicitly.

## Diagrams

Preference order:

1. **Mermaid**, inline in the document. Preferred default.
2. **Excalidraw** source committed to `_assets/<doc-slug>/<diagram>.excalidraw`, with a PNG export alongside, referenced from the document.
3. **Hand-authored HTML/CSS + screenshot** if neither of the above produces a readable result.

Rules:

- Every diagram must be reproducible from committed source — no binary-only images.
- Diagrams live in `contracts/docs/_assets/<doc-slug>/` when they are files, not inline.
- Prefer one diagram that communicates one idea over a crowded diagram that tries to say everything.

## Cross-references

- Use relative paths: `[arbitrator](../layer-1-core/01-arbitrator.md)`.
- Refer to Solidity identifiers in backticks: `KlerosCore.createDispute()`, `IArbitratorV2`.
- Refer to on-chain constants as `NAME = value`: `DISPUTE_KIT_CLASSIC = 1`.
- Link to specific section anchors when referencing a particular guarantee or invariant.
- Cite normative IDs across documents as `G-<N>` / `INV-<N>` plus the doc slug if not obvious from context: e.g. "violates `layer-1-core/01-arbitrator` INV-3".

## Open questions

Each `[OPEN QUESTION Q-<NNN>]` in a document must have a matching row in [open-questions.md](open-questions.md).

- `<NNN>` is a zero-padded three-digit sequence, assigned globally across all documents. The next available number is allocated when a new question is registered.
- Questions are never deleted or renumbered; they transition through `open` → `answered` or `open` → `deferred`.

## Versioning

- `version` is semver for the **document**, independent of the protocol version.
- **Major** bump: substantive change to scope or guarantees.
- **Minor** bump: added sections, added examples, added open questions.
- **Patch** bump: editorial only (wording, typos, link fixes).
- `last_updated` reflects any edit, no matter how small.
- Entries in [CHANGELOG.md](../CHANGELOG.md) are required once a document reaches `review`; before that, per-doc `version` + `last_updated` is sufficient.

## Status lifecycle

| Status | Meaning |
|--------|---------|
| `planned` | Document path is reserved; no substantive content yet. |
| `placeholder` | Stub with scope and expected contents but no specification. |
| `draft` | Under active writing. Subject to change without notice. |
| `review` | Content complete; awaiting sign-off. |
| `stable` | Signed off. Substantive changes require version bump and re-review. |
| `superseded` | Replaced by another document (record the replacement in the body). |

## Template

Starter template for a new specification document:

```markdown
---
title:
slug:
layer:
category: specification
status: draft
version: 0.1.0
last_updated: YYYY-MM-DD
authors:
  - jaybuidl
depends_on: []
implementation_status: live
open_questions: []
---

# <Title>

## Overview

One paragraph: what does this document specify?

## Guarantees

- **G-1** — ...
- **G-2** — ...

## Non-guarantees

- ...

## Actors and permissions

| Actor | Permissions |
|-------|-------------|
| ... | ... |

## Behavior

### <operation>

...

## Invariants

- **INV-1** — ...
- **INV-2** — ...

## Error conditions

| Error | Condition | Actor impact |
|-------|-----------|--------------|
| ... | ... | ... |

## Events

| Event | Emitted when | Purpose |
|-------|--------------|---------|
| ... | ... | ... |

## Traceability

| ID | Statement | Implementation |
|----|-----------|----------------|
| G-1 | ... | `contracts/src/.../<File>.sol:<fn>:L<n>` |
| INV-1 | ... | `contracts/src/.../<File>.sol:<fn>:L<n>` |

## Verification

| ID | Test |
|----|------|
| INV-1 | `<File>.t.sol::<testFn>` |

## Security considerations

- ...

## Related documents

- [Link](path)
```
