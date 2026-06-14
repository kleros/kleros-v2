---
title: Glossary
slug: _meta/glossary
layer: null
category: reference
status: draft
version: 0.3.1
last_updated: 2026-06-14
authors:
  - jaybuidl
depends_on: []
implementation_status: not-applicable
open_questions: []
---

# Glossary

Canonical definitions of terms used across the Kleros v2 specifications. Each term is defined once here; specifications link to this page rather than re-defining.

To add a term: include the term, the definition, and the document where it was first introduced. Keep definitions to one or two sentences - deeper treatment belongs in the specification that introduces the term.

## Terms

Terms are ordered alphabetically. "Introduced in" points to the specification that owns the canonical definition - for terms owned by placeholder specs, the entry below is provisional until the spec is written. If a term's meaning is ambiguous at time of writing, it is tagged with `[OPEN QUESTION Q-<NNN>]`.

| Term | Definition | Introduced in |
|------|------------|---------------|
| Appeal fees | Fees required to fund an appeal round, typically split across the parties who want the outcome reconsidered. Exact split and refund rules depend on the dispute kit. | [layer-1-core/03-dispute-kits](../layer-1-core/03-dispute-kits.md) |
| Appeal round | A subsequent round of a dispute funded by appellants, drawing a larger juror pool to reconsider the outcome. | [layer-1-core/03-dispute-kits](../layer-1-core/03-dispute-kits.md) |
| Arbitrable | A contract that requests arbitration and is expected to honor the ruling returned by the arbitrator. Kleros v2 arbitrables implement `IArbitrableV2`, a superset of ERC-792. | [layer-1-core/05-integration-surface](../layer-1-core/05-integration-surface.md) |
| Arbitration fees | Fees paid by the arbitrable when creating a dispute; finance juror fees and protocol overhead. | [layer-1-core/01-arbitrator](../layer-1-core/01-arbitrator.md) |
| Arbitrator | A contract that accepts dispute requests and produces rulings. The canonical Kleros v2 arbitrator is `KlerosCore`, exposing `IArbitratorV2`. | [layer-1-core/01-arbitrator](../layer-1-core/01-arbitrator.md) |
| Coherence | Measure of how closely a juror's vote aligns with the winning outcome of a dispute round; used by the dispute kit to compute reward and penalty distributions. | [layer-1-core/03-dispute-kits](../layer-1-core/03-dispute-kits.md) |
| Court | A named node in the court tree with its own parameters (fees, drawing rules, policy) in which jurors stake and from which jurors are drawn. | [layer-1-core/04-courts](../layer-1-core/04-courts.md) |
| Dispute | A case submitted to the arbitrator by an arbitrable, resolved by jurors into a ruling. Moves through the `evidence`, `commit`, `vote`, `appeal`, and `execution` periods defined by `KlerosCore`. | [layer-1-core/01-arbitrator](../layer-1-core/01-arbitrator.md) |
| Dispute kit | A pluggable set of rules for juror drawing, vote aggregation, incentive distribution, and appeals. Implements `IDisputeKit`. | [layer-1-core/03-dispute-kits](../layer-1-core/03-dispute-kits.md) |
| Dispute template | A JSON document describing the UI-facing structure of a dispute (question, answers, context), registered via `DisputeTemplateRegistry`. | [layer-1-core/06-onchain-metadata](../layer-1-core/06-onchain-metadata.md) |
| Evidence group | The set of evidence items submitted for a given dispute, typically identified by a shared group ID and surfaced through `EvidenceModule`. | [layer-1-core/06-onchain-metadata](../layer-1-core/06-onchain-metadata.md) |
| Foreign chain | A chain other than the home chain on which an arbitrable requests arbitration via the Layer 2 gateways. | [00-overview](../00-overview.md) |
| Fork | A divergence of the PNK token, triggered when a dispute reaches the forking court, into one continuing "main fork" and one or more "minority forks"; it lets an honest minority exit a malicious-majority outcome. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| Fork token | A new ERC-20 (`PNK2 … PNKₙ`) minted at genesis for each viable minority fork, replicating the PNK interface; balances are the supply-equalized, redistributed weights of that fork's participants. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| Forking court | The root court (`FORKING_COURT`, ID 0), parent of the General Court, reached when a dispute exhausts General Court appeals; it hosts the single terminal forking round. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| Forking round | The single, terminal, all-holder commit/reveal vote held in the forking court that determines both the final ruling and fork membership. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| Forking threshold | The minimum fork size (in PNK weight) a holder requires before being willing to join a minority fork for their chosen losing option. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| General court | The root of the ordinary court tree, where disputes originate and to which all ordinary courts are descendants. The forking court (`FORKING_COURT`, ID 0) sits above it as its parent, reached only when a dispute exhausts General Court appeals. | [layer-1-core/04-courts](../layer-1-core/04-courts.md) |
| Governor | A privileged address (typically a multisig or DAO-controlled contract) authorized to change protocol parameters and add or remove courts, dispute kits, and supported tokens. | [00-overview](../00-overview.md) |
| Home chain | The chain where the arbitrator is deployed and where rulings are produced. | [00-overview](../00-overview.md) |
| Juror | A PNK holder who has staked in one or more courts and is therefore drawable for disputes. | [00-overview](../00-overview.md) |
| Juror fees | Portion of arbitration fees paid to jurors who participated in a dispute round, distributed according to the dispute kit's coherence rules. | [layer-1-core/01-arbitrator](../layer-1-core/01-arbitrator.md) |
| Lock (locked PNK) | Portion of a juror's stake held against an active dispute; not available for withdrawal until the dispute resolves. Tracked as `lockedPnk` in the sortition module's `Juror` struct. | [layer-1-core/02-sortition](../layer-1-core/02-sortition.md) |
| Main fork | The fork whose winning option (`a_main`) becomes the dispute's final ruling; it continues as the existing PNK token and arbitrator. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| Minority fork | A fork to a losing option, materialized as a new fork token when its joiner set is non-empty under the removal fixed point. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| PNK | The staking token. Standard ERC-20; jurors `approve` and `transferFrom` to the arbitrator to stake. | [00-overview](../00-overview.md) |
| Policy | A JSON document registered per court describing the court's subject matter and resolution rules, referenced by URI via `PolicyRegistry`. | [layer-1-core/06-onchain-metadata](../layer-1-core/06-onchain-metadata.md) |
| Removal fixed point | The rule selecting a minority fork's joiner set: iteratively evict the highest-threshold member while their threshold exceeds the remaining support, until the set is stable. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| Ruling | The outcome of a dispute, delivered by the arbitrator back to the arbitrable via the `IArbitrableV2.rule()` callback. | [layer-1-core/01-arbitrator](../layer-1-core/01-arbitrator.md) |
| Sortition | Random selection of jurors weighted by their staked PNK. | [layer-1-core/02-sortition](../layer-1-core/02-sortition.md) |
| Sortition tree | A data structure indexing juror stake amounts per court to enable deterministic, stake-weighted random draws. Implemented by the `SortitionTrees` library. | [layer-1-core/02-sortition](../layer-1-core/02-sortition.md) |
| Stake (staked PNK) | PNK committed by a juror to a court; included in that court's sortition tree for juror drawing. Tracked as `stakedPnk` in the sortition module's `Juror` struct. | [layer-1-core/02-sortition](../layer-1-core/02-sortition.md) |
| Stake freeze | The suspension of all staked-PNK balance mutations for the duration of a forking round, so the live stake serves as the vote-weight snapshot. | [layer-1-core/07-forking](../layer-1-core/07-forking.md) |
| Subcourt | Alias of "court", used when emphasizing its position below a parent in the court tree. | [layer-1-core/04-courts](../layer-1-core/04-courts.md) |
