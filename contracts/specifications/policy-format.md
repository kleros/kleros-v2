# 📜 Policy Format Specification

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
  - Example: `"General Court"`

- **purpose** (required)

  - Type: `string`
  - Description: A detailed description of the court's purpose and the types of cases it handles
  - Format: Markdown text
    - Should not start with a "Purpose:" heading as it's implied
    - Any headings should start from `###` (h3)
    - Example sections: "### Example", "### Use Cases"
  - Example: `"The General court exists as the top court in the hierarchy.\n\nAll appeals made in subcourts will make their way to the General Court.\n\n### Example\nA case appealed from the Blockchain court."`

- **rules** (required)

  - Type: `string`
  - Description: The set of rules and guidelines that jurors must follow when arbitrating cases
  - Format: Markdown text
    - Should not start with a "Rules:" heading as it's implied
    - Any headings should start from `###` (h3)
    - Example sections: "### Default Rules", "### Special Cases"
    - Can use bullet points for listing rules
  - Example: `"- All policies of a court also apply to all of its child subcourts.\n- Jurors should cast their vote with a suitable verification.\n\n### Special Cases\nFor cases involving privacy coins..."`

- **requiredSkills** (optional)

  - Type: `string`
  - Description: Specific skills or qualifications that jurors should possess
  - Format: Markdown text
    - Should not start with a "Required Skills:" heading as it's implied
    - Any headings should start from `###` (h3)
    - Example sections: "### Technical Skills", "### Language Requirements"
  - Example: `"This court requires a good level of solidity. Jurors who are not solidity intermediate developers are advised to stake into this court only if they also know how to make relatively simple contracts.\n\n### Technical Skills\n- Smart contract development\n- Security auditing"`

- **court** (required)

  - Type: `number`
  - Description: Unique identifier for the court
  - Format: Positive integer
  - Example: `1`

- **uri** (required)
  - Type: `string`
  - Description: IPFS URI pointing to the JSON file containing this policy
  - Format: IPFS path starting with "/ipfs/"
  - Example: `"/ipfs/QmRwmJAF8NK1r3fAS8dHofbTKsuhWSd3LruzkjrpNNBprC"`

## 💡 Examples

### 🏛️ General Court

```json
{
  "name": "General Court",
  "purpose": "The General court exists as the top court in the hierarchy.\n\nAll appeals made in subcourts will make their way to the General Court.",
  "rules": "- All policies of a court also apply to all of its child subcourts.\n- Jurors should cast their vote with a suitable verification.",
  "court": 1,
  "uri": "/ipfs/QmRwmJAF8NK1r3fAS8dHofbTKsuhWSd3LruzkjrpNNBprC"
}
```

### ⚙️ Specialized Court

```json
{
  "name": "Solidity Court",
  "purpose": "",
  "rules": "If the disputed code is of significant size (> 500 code lines), parties in the dispute should point out specific parts of the content which are being disputed. Otherwise, jurors should refuse to arbitrate.",
  "requiredSkills": "This court requires a good level of solidity. Jurors who are not solidity intermediate developers are advised to stake into this court only if they also know how to make relatively simple contracts, know the main solidity hacks and can compute the complexity of simple functions.",
  "court": 26,
  "uri": "/ipfs/QmPRckaaNLj9ycZH6otChTwbkDsBnhkNrXnarF5vD6rXKy"
}
```

## 🛠️ Implementation Notes

1. Policies are immutable once uploaded to IPFS
2. The `uri` field should match the IPFS hash where the policy is stored
3. All text fields support markdown formatting for better readability
4. Empty strings are valid for optional fields or when information is not available
5. Court IDs must be unique across the system
6. Child courts inherit policies from their parent courts

## 🔗 Related Components

- `PolicyRegistry.sol`: Smart contract for managing court policies and tracking updates through events
- Court hierarchy system: Manages policy inheritance from parent to child courts
- IPFS: Provides immutable storage for policy content

## 🔒 Security Considerations

1. Only the governor can update policies through the `PolicyRegistry` contract
2. Policy updates are tracked through the `PolicyUpdate` event
3. Court IDs are immutable and cannot be reused
