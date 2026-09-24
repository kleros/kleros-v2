# 📜 Policy Format Specification

> Last updated: 2026-03-14 | Based on: kleros-v2 contracts @ dev branch

## 📋 Overview

This document specifies the format of court policies in the Kleros V2 protocol. Policies are JSON objects that define the rules, purpose, and requirements for each court. They are stored in IPFS and referenced through the `PolicyRegistry` contract.

## 🔧 Format

The policy parameter must be a JSON object containing the following properties:

```typescript
{
  name: string;           // The name of the court
  purpose: string;        // Description of the court's purpose and scope
  rules: string;         // Rules and guidelines for jurors (in markdown format)
  requiredSkills?: string; // Optional. Skills required for jurors
  court: number;         // The unique identifier of the court
  uri: string;           // IPFS URI pointing to this policy file
}
```

### 📝 Properties

- **name** (required)

  - Type: `string`
  - Description: The official name of the court
  - Authority: This is the authoritative name, as registered in the `PolicyRegistry`
  - Example: `"General Court"`

- **purpose** (required)

  - Type: `string`
  - Description: A detailed description of the court's purpose and the types of cases it handles
  - Format: Markdown text
    - Should not start with a "Purpose:" heading as it's implied
    - Any headings should start from `###` (h3)
    - Example sections: "### Example", "### Use Cases", "### Scope"
  - Example: `"The General court exists as the top court in the hierarchy.\n\nAll appeals made in subcourts will make their way to the General Court.\n\n### Example\nA case appealed from the Blockchain court."`

- **rules** (required)

  - Type: `string`
  - Description: The set of rules and guidelines that jurors must follow when arbitrating cases
  - Format: Markdown text
    - Should not start with a "Rules:" heading as it's implied
    - Any headings should start from `###` (h3)
    - Example sections: "### Default Rules", "### Special Cases", "### Voting Guidelines"
    - Can use bullet points for listing rules
  - Example: `"- All policies of a court also apply to all of its child subcourts.\n- Jurors should cast their vote with a suitable verification.\n\n### Special Cases\nFor cases involving privacy coins..."`

- **requiredSkills** (optional)

  - Type: `string`
  - Description: Specific skills or qualifications that jurors should possess
  - Format: Markdown text
    - Should not start with a "Required Skills:" heading as it's implied
    - Any headings should start from `###` (h3)
    - Example sections: "### Technical Skills", "### Language Requirements", "### Professional Experience"
  - Example: `"This court requires a good level of solidity. Jurors who are not solidity intermediate developers are advised to stake into this court only if they also know how to make relatively simple contracts.\n\n### Technical Skills\n- Smart contract development\n- Security auditing"`

- **court** (required)

  - Type: `number`
  - Description: Unique identifier for the court
  - Format: Positive integer
  - Validation: Must correspond to an existing court ID in the system
  - Example: `1`

- **uri** (required)
  - Type: `string`
  - Description: IPFS URI pointing to the JSON file containing this policy
  - Format: IPFS path starting with "/ipfs/"
  - Purpose: Enables verification that the policy content matches its IPFS hash
  - Example: `"/ipfs/QmRwmJAF8NK1r3fAS8dHofbTKsuhWSd3LruzkjrpNNBprC"`

## 🏛️ Court Hierarchy and Policy Inheritance

### Inheritance Rules

1. **Parent Court Policies Apply**
   - All policies of a parent court automatically apply to child courts
   - Child courts can add additional rules but cannot override parent rules
   - Creates a hierarchical rule system with increasing specialization

2. **Rule Precedence**
   - Parent court rules take precedence in case of conflicts
   - Child court rules supplement rather than replace parent rules
   - General Court rules apply to all courts in the system

3. **Effective Policy Calculation**
   ```
   Effective Policy = General Court Policy + 
                     Parent Court Chain Policies + 
                     Current Court Policy
   ```

### Policy Chain Example

For a dispute in the "Solidity Court" (ID: 26):
1. **General Court** (ID: 1): Base arbitration rules
2. **Development Court** (ID: 25): Software development expertise rules  
3. **Solidity Court** (ID: 26): Smart contract specific requirements

All three policy sets apply, with General Court rules having highest precedence.

## 💡 Examples

### 🏛️ General Court

```json
{
  "name": "General Court",
  "purpose": "The General court exists as the top court in the hierarchy.\n\nAll appeals made in subcourts will make their way to the General Court.\n\n### Scope\nThe General Court handles all disputes that do not fit into specialized subcourts, as well as appeals from all other courts.",
  "rules": "- All policies of a court also apply to all of its child subcourts.\n- Jurors should cast their vote with a suitable verification.\n- Evidence submission must be relevant and factual.\n\n### Default Rules\n- Jurors must review all submitted evidence\n- Voting should be based on factual analysis\n- Appeals should be considered carefully",
  "court": 1,
  "uri": "/ipfs/QmRwmJAF8NK1r3fAS8dHofbTKsuhWSd3LruzkjrpNNBprC"
}
```

### ⚙️ Technical Specialized Court

```json
{
  "name": "Solidity Court",
  "purpose": "This court specializes in disputes involving Solidity smart contracts, code reviews, and blockchain development issues.\n\n### Use Cases\n- Smart contract bug bounty disputes\n- Code quality assessments\n- Contract functionality verification\n- Development milestone disputes",
  "rules": "If the disputed code is of significant size (> 500 code lines), parties in the dispute should point out specific parts of the content which are being disputed. Otherwise, jurors should refuse to arbitrate.\n\n### Technical Guidelines\n- Focus on objective code analysis\n- Consider industry best practices\n- Evaluate security implications",
  "requiredSkills": "This court requires a good level of solidity. Jurors who are not solidity intermediate developers are advised to stake into this court only if they also know how to make relatively simple contracts, know the main solidity hacks and can compute the complexity of simple functions.\n\n### Technical Skills\n- Solidity programming (intermediate+)\n- Smart contract security awareness\n- Gas optimization understanding\n- Testing framework knowledge",
  "court": 26,
  "uri": "/ipfs/QmPRckaaNLj9ycZH6otChTwbkDsBnhkNrXnarF5vD6rXKy"
}
```

### 🌍 Language-Specific Court

```json
{
  "name": "Spanish-English Translation",
  "purpose": "This court handles disputes related to translation quality and accuracy between Spanish and English languages.\n\n### Scope\n- Translation accuracy verification\n- Cultural context appropriateness\n- Technical terminology correctness",
  "rules": "- Jurors must be fluent in both Spanish and English\n- Consider cultural nuances and context\n- Technical terms should maintain accuracy\n- Provide specific feedback on translation issues",
  "requiredSkills": "### Language Requirements\n- Native or near-native fluency in both Spanish and English\n- Understanding of cultural contexts\n- Experience with translation work preferred\n\n### Technical Skills\n- Grammar and syntax expertise\n- Terminology accuracy\n- Cultural sensitivity",
  "court": 14,
  "uri": "/ipfs/QmHash789...TranslationPolicy"
}
```

## 🔄 Policy Management

### Policy Updates

1. **Immutability**: Individual policy documents are immutable once stored on IPFS
2. **Versioning**: New policies create new IPFS hashes
3. **Registry Updates**: `PolicyRegistry` contract tracks policy changes via events
4. **Governance**: Only authorized governance can update court policies

### Update Process

```solidity
// PolicyRegistry update process
function setPolicy(uint96 _courtID, string calldata _policy) external onlyByOwner {
    emit PolicyUpdate(_courtID, _policy);
}
```

**Events**:
```solidity
event PolicyUpdate(uint96 indexed _courtID, string _policy);
```

### Validation Requirements

1. **JSON Structure**: Policy must be valid JSON
2. **Required Fields**: All required fields must be present and non-empty
3. **Court ID Validation**: Court ID must reference existing court
4. **URI Consistency**: URI should match IPFS hash of the content
5. **Markdown Formatting**: Rules and descriptions should use proper markdown

## 🛠️ Implementation Guidelines

### For Policy Authors

1. **Clarity**: Write clear, unambiguous rules
2. **Completeness**: Cover all aspects of court operation
3. **Hierarchy Awareness**: Consider parent court rules
4. **Skill Requirements**: Be specific about juror qualifications
5. **Examples**: Provide concrete examples where helpful

### For Developers

1. **Validation**: Validate policy structure before submission
2. **IPFS Integrity**: Verify IPFS hash matches content
3. **Event Tracking**: Monitor policy update events
4. **Cache Management**: Handle policy caching appropriately
5. **Fallback Handling**: Provide fallbacks for IPFS unavailability

## 🔒 Security Considerations

1. **Governance Control**: Only governance can update policies
2. **Immutability**: Policies cannot be tampered with once published
3. **Integrity Verification**: IPFS hashes provide content verification
4. **Availability**: IPFS ensures decentralized policy availability
5. **Version Tracking**: Event logs provide complete policy history

## 📊 Best Practices

### Content Guidelines

1. **Objective Language**: Use clear, objective language
2. **Specific Instructions**: Provide actionable guidance for jurors
3. **Cultural Sensitivity**: Consider diverse juror backgrounds
4. **Legal Clarity**: Avoid ambiguous legal terms
5. **Regular Updates**: Update policies as courts evolve

### Technical Guidelines

1. **Markdown Structure**: Use consistent markdown formatting
2. **Link Management**: Ensure external links remain valid
3. **File Size**: Keep policies concise but comprehensive
4. **Accessibility**: Write for diverse skill levels
5. **Translation**: Consider multi-language support for international courts

## 🔗 Related Components

- `PolicyRegistry.sol`: Smart contract for managing court policies and tracking updates
- `KlerosCore.sol`: References policies for court operation
- Court hierarchy system: Manages policy inheritance from parent to child courts
- IPFS: Provides immutable, decentralized storage for policy content
- Governance system: Controls policy updates and court management