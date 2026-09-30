# 🏛️ Courts Specification

## 📋 Overview

This document specifies the format and structure of courts in the Kleros V2 protocol. Courts are organized in a hierarchical tree structure where each court can have a parent court and multiple child courts. Courts are created through the `KlerosCore` contract and their configuration is stored on-chain.

## 🔧 Format

Each court is defined by the following properties:

```typescript
{
  name: string;               // The name of the court
  id: number;                 // Unique identifier for the court
  parent: number;             // ID of the parent court (can be self-referential for root court)
  hiddenVotes: boolean;       // Whether juror votes are hidden during voting period
  minStake: string;          // Minimum amount of PNK tokens required to stake (in wei)
  feeForJuror: string;       // Fee paid to jurors per dispute (in wei)
  alpha: string;             // PNK collateral per drawn vote, expressed as a fraction of minStake (in basis points)
  jurorsForCourtJump: string; // Number of jurors for a dispute to jump to parent court
  timesPerPeriod: number[];   // Duration of each period [evidence, commit, vote, appeal] in seconds
}
```

### 📝 Properties

- **name** (required)

  - Type: `string`
  - Description: Documentation-only field for readability
  - Note: This name is NOT authoritative. The official court name is defined in the `PolicyRegistry` contract
  - Usage: For configuration readability and documentation purposes only
  - Example: `"General Court"`

- **id** (required)

  - Type: `number`
  - Description: Unique identifier for the court
  - Constraints: Must be unique across all courts
  - Example: `1`

- **parent** (required)

  - Type: `number`
  - Description: ID of the parent court
  - Constraints:
    - Must reference an existing court ID
    - Final Court has parent=0. General Court is its child and also has parent=0
    - Creates a hierarchical tree structure
  - Example: `1`

- **hiddenVotes** (required)

  - Type: `boolean`
  - Description: Whether juror votes are hidden during the voting period
  - Security: Helps prevent vote manipulation and bias
  - Example: `true`

- **minStake** (required)

  - Type: `string`
  - Description: Minimum amount of PNK tokens required to stake
  - Format: Wei value as string
  - Example: `"2300000000000000000000"` (2,300 PNK)

- **feeForJuror** (required)

  - Type: `string`
  - Description: Fee paid to jurors per dispute
  - Format: Wei value as string
  - Example: `"5000000000000000"` (0.005 ETH)

- **alpha** (required)

  - Type: `string`
  - Description: PNK collateral per drawn vote, expressed as a fraction of minStake
  - Format: Basis points (1/10000)
  - Example: `"10000"` (100%)

- **jurorsForCourtJump** (required)

  - Type: `string`
  - Description: Number of jurors required for a dispute to jump to parent court
  - Constraints: Must be an odd number for majority voting
  - Example: `"511"`

- **timesPerPeriod** (required)
  - Type: `number[]`
  - Description: Duration of each period in seconds
  - Format: Array of 4 numbers representing:
    1. Evidence period
    2. Commit period
    3. Vote period
    4. Appeal period
  - Example: `[280800, 583200, 583200, 388800]`

## 🌳 Hierarchy Rules

1. **Reserved Court IDs**

   - Court ID 0 is reserved for the "Final Court"
   - Court ID 1 is the General Court
   - All other court IDs must be greater than 1

2. **Root Court Structure**

   - The Final Court (ID: 0) is the ultimate root-level court
   - The General Court is a child of the Final Court
   - The Final Court is designed to handle protocol-level disputes and forking decisions

3. **Parent-Child Relationships**

   - Each court (except root) must have a valid parent court
   - A court can have multiple child courts
   - Child courts inherit certain properties from their parent:
     - Policy rules (see policy-format.md)

4. **Appeals Flow**
   - Disputes can be appealed to parent courts
   - Number of jurors typically increases with each appeal
   - The `jurorsForCourtJump` parameter determines when a dispute jumps to parent
   - Currently: All appeals eventually reach the General Court
   - Future: Protocol-level appeals may reach the Final Court

## ⚙️ DisputeKit Compatibility

Courts can be configured to support specific dispute resolution mechanisms through DisputeKits:

1. **Supported Kits**

   - Each court specifies which DisputeKits it supports
   - Multiple kits can be supported simultaneously

2. **Configuration**
   - Specified during court creation via `_supportedDisputeKits` array
   - Each element is an index referencing a registered DisputeKit

## 💡 Example

```json
{
  "name": "General Court",
  "id": 1,
  "parent": 0,
  "hiddenVotes": true,
  "minStake": "2300000000000000000000",
  "feeForJuror": "5000000000000000",
  "alpha": "10000",
  "jurorsForCourtJump": "511",
  "timesPerPeriod": [280800, 583200, 583200, 388800]
}
```

## 🔒 Security Considerations

1. Only the governor can create new courts
2. Court IDs are immutable and cannot be reused
3. Parent-child relationships are immutable
4. Hidden votes help prevent vote manipulation
5. Juror counts must be odd numbers for clear majority
6. Stake requirements help prevent Sybil attacks

## 🔗 Related Components

- `KlerosCore.sol`: Contract for creating and managing courts
- `PolicyRegistry.sol`: Manages court policies and defines authoritative court names
- DisputeKit contracts: Implement specific dispute resolution mechanisms
- Sortition module: Handles random juror selection
