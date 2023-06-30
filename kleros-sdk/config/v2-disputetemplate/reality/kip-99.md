---
kip: KIP-99
title: Reality.eth v2.1 as an arbitrable
author: Jaybuidl (@jaybuidl)
discussions-to: https://forum.kleros.io/c/proposal/<#>
status: Draft
type: Arbitrable
created: 2023-04-08
---

## Summary

This proposal intends to provide an explicit specification describing how the Kleros protocol handles arbitration requests originating from the Reality.eth v2.1 protocol.

## Motivation

The Reality protocol is the most complex integration of the Kleros protocol so far. Prior to this proposal, there has been a lack of a comprehensive specification.

Contributing to the complexity of this integration are: the dynamic nature of the questions and possible answers, an extra reserved answer ("answered too soon"), and a different encoding of the "invalid/refused to arbitrate" answer.

## Technical Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119 and RFC 8174.

### Supported functionalities

#### Question types

| Reality         | Kleros                     |
| --------------- | -------------------------- |
| bool            | ✅ maps to `single-select` |
| uint            | TBC                        |
| single-select   | ✅                         |
| multiple-select | TBC                        |
| datetime        | TBC                        |

### Dispute details document

#### New reserved answer

The answers must include:

```json
{
  "id": "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
  "title": "Answered Too Soon",
  "reserved": true
}
```

#### External dispute identifier

```
externalDisputeID = realityQuestionID
```

#### Metadata

##### Population of the Reality template

1. Retrieve the Reality contract address: it is the address calling into `arbitrable.requestArbitration()`
1. Querying the event `LogNewQuestion` for the requested `realityQuestionID` on the Reality contract.
1. Retrieve the reality template by querying the event `LogNewTemplate` for `template_id` on the Reality contract.
1. Execute the template:

```typescript
rc_question = require("@reality.eth/reality-eth-lib/formatters/question.js");
rc_question.populatedJSONForTemplate(LogNewTemplate.question_text, LogNewQuestion.question);
```

##### Metadata object

```typescript
{
  realityAddress = callerOf(arbitrable.requestArbitration());
  realityTemplateID = LogNewQuestion.template_id;
  realityQuestionID = LogNewQuestion.question_id;
  realityUser = LogNewQuestion.user;
  realityType = populatedJSONForTemplate.type;
  realityCategory = populatedJSONForTemplate.category;
  realityLang = populatedJSONForTemplate.lang;
  realityFormat = populatedJSONForTemplate.format;
  realityTimeout = LogNewQuestion.timeout;
  realityOpeningTime = LogNewQuestion.opening_ts;
  realityCreationTime = LogNewQuestion.created;
  realityNonce = LogNewQuestion.nonce;
  realityFrontendUrl = frontendUrl + metadata.realityAddress + "-" + metadata.realityQuestionID;
}
```

### Arbitrable contract requirements

#### Answer encoding

```typescript
realityRuling = bytes32(klerosRuling - 1);
```

#### Interaction sequence

[TODO](https://github.com/RealityETH/reality-eth-monorepo/blob/5565f55d19f627179f04d79a577ed6906ba78462/packages/docs/arbitrators.rst#creating-and-using-an-arbitration-contract)

#### Views

[TODO](https://github.com/RealityETH/reality-eth-monorepo/blob/5565f55d19f627179f04d79a577ed6906ba78462/packages/docs/arbitrators.rst#getting-information-about-the-arbitrator): `realitio()` pointing to Reality, metadata indicating template restrictions, terms of services, cross-chain arbitration.

## Rationale

TODO: the rationale should flesh out the specification by describing what motivated the design and why particular design decisions were made, as well as any alternative designs that were considered.

## Implementation

TODO: an implementation must be completed before any KIP proceeds to “Last Call” status.

## Backwards Compatibility

TODO

## Security considerations

All KIPs must include a discussion of the security implications/considerations relevant to the proposed change as well as proposed mitigations. A KIP cannot proceed to “Final” status without a sufficient security review from the core team.
