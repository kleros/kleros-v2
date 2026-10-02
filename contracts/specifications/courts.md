# 🏛️ Courts Specification

> Last updated: 2026-03-14 | Based on: kleros-v2 contracts @ dev branch

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
  alpha: string;             // Chance of being drawn as juror based on stake (in basis points)
  jurorsForCourtJump: string; // Number of jurors for a dispute to jump to parent court
  timesPerPeriod: number[];   // Duration of each period [evidence, vote, appeal, execution] in seconds
  supportedDisputeKits: number[]; // Array of dispute kit IDs supported by this court
  eligibility?: string;       // Optional address of eligibility predicate contract
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
    - Root court references itself (e.g., General Court has parent=1)
    - Creates a hierarchical tree structure
  - Example: `1`

- **hiddenVotes** (required)

  - Type: `boolean`
  - Description: Whether juror votes are hidden during the voting period
  - Security: Helps prevent vote manipulation and bias
  - Implementation: Enables commit-reveal voting mechanism
  - Example: `true`

- **minStake** (required)

  - Type: `string`
  - Description: Minimum amount of PNK tokens required to stake
  - Format: Wei value as string
  - Inheritance: Child courts cannot have lower minimum stake than parent
  - Example: `"2300000000000000000000"` (2,300 PNK)

- **feeForJuror** (required)

  - Type: `string`
  - Description: Fee paid to jurors per dispute
  - Format: Wei value as string (ETH denomination)
  - Usage: Multiplied by number of jurors to determine total arbitration cost
  - Example: `"5000000000000000"` (0.005 ETH)

- **alpha** (required)

  - Type: `string`
  - Description: Percentage of stake lost when voting incoherently
  - Format: Basis points (1/10000)
  - Range: 0 to 10000 (0% to 100%)
  - Example: `"10000"` (100% - full penalty for incoherent votes)

- **jurorsForCourtJump** (required)

  - Type: `string`
  - Description: Number of jurors required for a dispute to jump to parent court on appeal
  - Constraints: Must be an odd number for majority voting
  - Usage: When a dispute reaches this number of jurors, the next appeal jumps to the parent court
  - Example: `"511"`

- **timesPerPeriod** (required)

  - Type: `number[]`
  - Description: Duration of each dispute period in seconds
  - Format: Array of 4 numbers representing:
    1. Evidence period (submission and juror drawing)
    2. Commit period (hidden vote commits, if enabled)
    3. Vote period (vote reveal or direct voting)
    4. Appeal period (appeal funding window)
    5. Execution period (automatic, not configurable)
  - Example: `[280800, 583200, 583200, 388800]`

- **supportedDisputeKits** (required)

  - Type: `number[]`
  - Description: Array of dispute kit IDs that this court supports
  - Constraints:
    - Must include Classic Dispute Kit (ID: 1) - mandatorily required
    - All IDs must reference valid, registered dispute kits
    - Child courts inherit supported kits from parents
  - Usage: Determines which dispute resolution mechanisms can be used
  - Example: `[1, 2, 3]` (Classic, Sybil-Resistant, Gated)

- **eligibility** (optional)
  - Type: `string`
  - Description: Address of the eligibility predicate contract
  - Interface: Must implement `ICourtEligibility`
  - Purpose: Defines custom requirements for juror participation
  - Default: No eligibility requirements if not specified
  - Example: `"0x1234...abcd"` (address of PoH verification contract)

### Storage Layout

Courts include `__gap` storage slots (typically 10 slots) reserved for future upgrades, ensuring that new fields can be added without breaking existing deployments.

## 🌳 Hierarchy Rules

1. **Reserved Court IDs**

   - Court ID 0 is reserved for the future "Forking Court"
   - Court ID 1 is the General Court, currently serving as root
   - All other court IDs must be greater than 1

2. **Root Court Structure**

   - Currently: The General Court (ID: 1) acts as the root of the hierarchy
   - Future: The Forking Court (ID: 0) will become the ultimate root-level court
   - The General Court will become a child of the Forking Court
   - The Forking Court is designed to handle protocol-level disputes and forking decisions

3. **Parent-Child Relationships**

   - Each court (except current/future root) must have a valid parent court
   - A court can have multiple child courts
   - Child courts inherit certain properties from their parent:
     - Policy rules (see policy-format.md)
     - Supported dispute kits (child can support subset of parent's kits)
     - Stake requirements (child minStake ≥ parent minStake)

4. **Appeals Flow**
   - Disputes can be appealed to parent courts
   - Number of jurors typically increases with each appeal
   - The `jurorsForCourtJump` parameter determines when a dispute jumps to parent
   - Currently: All appeals eventually reach the General Court
   - Future: Protocol-level appeals may reach the Forking Court

## ⚙️ DisputeKit Compatibility

Courts can be configured to support specific dispute resolution mechanisms through DisputeKits:

### 1. Supported Kits Configuration

```solidity
struct Court {
    // ... other fields ...
    mapping(uint256 disputeKitId => bool) supportedDisputeKits;
    // ... other fields ...
    uint256[10] __gap; // Reserved storage slots for future upgrades
}
```

**Key Rules**:
- Each court specifies which DisputeKits it supports via the `supportedDisputeKits` mapping
- **Classic Dispute Kit (ID: 1) must be supported by all courts** - serves as universal fallback
- Additional dispute kits can be enabled/disabled by governance
- Child courts can support a subset of their parent's supported kits

### 2. Dispute Kit Types

**Classic Dispute Kit (ID: 1)**:
- Default implementation with plurality voting
- Proportional drawing weighted by staked PNK
- Mandatorily supported by all courts
- Serves as fallback when other kits are incompatible

**Sybil-Resistant Dispute Kit (ID: 2)**:
- Requires Proof of Humanity registration
- Equal drawing chances regardless of stake
- Optional for courts requiring human identity verification

**Gated Dispute Kit (ID: 3)**:
- Requires specific token holdings (ERC20/721/1155)
- Configurable token requirements per court
- Enables specialized expert juries

### 3. Configuration Management

```solidity
function enableDisputeKits(
    uint96 _courtID, 
    uint256[] memory _disputeKitIDs, 
    bool _enable
) external onlyByOwner
```

**Constraints**:
- Classic Dispute Kit cannot be disabled
- Only valid dispute kit IDs can be enabled
- Changes take effect immediately for new disputes
- Existing disputes continue with their original dispute kit

## 👥 Eligibility System

Courts can specify custom eligibility requirements through the `ICourtEligibility` interface:

### 1. Eligibility Interface

```solidity
interface ICourtEligibility {
    function isEligible(address _juror, uint96 _courtID) external view returns (bool);
}
```

### 2. Eligibility Predicate Examples

**Proof of Humanity Requirement**:
```solidity
contract PoHEligibility is ICourtEligibility {
    function isEligible(address _juror, uint96 _courtID) external view returns (bool) {
        return proofOfHumanity.isRegistered(_juror);
    }
}
```

**Token Gating**:
```solidity
contract TokenGatedEligibility is ICourtEligibility {
    mapping(uint96 => IERC20) public requiredTokens;
    mapping(uint96 => uint256) public minimumBalances;
    
    function isEligible(address _juror, uint96 _courtID) external view returns (bool) {
        return requiredTokens[_courtID].balanceOf(_juror) >= minimumBalances[_courtID];
    }
}
```

**Combined Requirements**:
```solidity
contract CombinedEligibility is ICourtEligibility {
    function isEligible(address _juror, uint96 _courtID) external view returns (bool) {
        return proofOfHumanity.isRegistered(_juror) && 
               specialistToken.balanceOf(_juror) > 0;
    }
}
```

### 3. Usage and Validation

- Checked during staking operations in `SortitionModule.validateStake()`
- Prevents ineligible jurors from staking in restricted courts
- Can be updated by governance for existing courts
- Set to `NULL_ELIGIBILITY_REQUIREMENT` (zero address) to disable restrictions

## 🛠️ Technical Parameters

### 1. Sortition Parameters

- `_sortitionExtraData`: Used to initialize the sortition sum tree
- Typically contains the K value (branching factor) for the k-ary tree
- **K value must be explicitly provided** (no default constant exists)
- Example: `ethers.toBeHex(5)` sets K=5 for tree branching

### 2. Validation Rules

**Stake Hierarchy**:
```solidity
// Parent court's minStake must be ≤ child's minStake
require(courts[_parent].minStake <= _minStake, "MinStakeLowerThanParentCourt");

// Child courts cannot have higher minStake than their parent allows
for (uint256 i = 0; i < court.children.length; i++) {
    require(courts[court.children[i]].minStake >= _minStake, "MinStakeHigherThanChildCourt");
}
```

**Dispute Kit Requirements**:
```solidity
// Must support at least one dispute kit
require(_supportedDisputeKits.length > 0, "UnsupportedDisputeKit");

// Must support Classic Dispute Kit
require(court.supportedDisputeKits[DISPUTE_KIT_CLASSIC], "MustSupportDisputeKitClassic");
```

## 💡 Example

### Basic Court Configuration

```json
{
  "name": "General Court",
  "id": 1,
  "parent": 1,
  "hiddenVotes": true,
  "minStake": "2300000000000000000000",
  "feeForJuror": "5000000000000000",
  "alpha": "10000",
  "jurorsForCourtJump": "511",
  "timesPerPeriod": [280800, 583200, 583200, 388800],
  "supportedDisputeKits": [1],
  "eligibility": null
}
```

### Specialized Court with Eligibility

```json
{
  "name": "Humanity Court",
  "id": 24,
  "parent": 1,
  "hiddenVotes": false,
  "minStake": "5300000000000000000000",
  "feeForJuror": "2400000000000000",
  "alpha": "2500",
  "jurorsForCourtJump": "31",
  "timesPerPeriod": [540000, 437400, 437400, 291600],
  "supportedDisputeKits": [1, 2],
  "eligibility": "0x1dAD862095d40d43c2109370121cf087632874dB"
}
```

## 🔒 Security Considerations

1. **Hierarchy Integrity**
   - Only the governor can create new courts
   - Court IDs are immutable and cannot be reused
   - Parent-child relationships are immutable once set

2. **Stake Security**
   - Minimum stake requirements prevent Sybil attacks
   - Hierarchy ensures progressive stake increases
   - Hidden votes help prevent vote manipulation

3. **Eligibility Enforcement**
   - Eligibility predicates checked during staking
   - Cannot be bypassed through delayed stakes
   - Predicates should be carefully audited for correctness

4. **Dispute Kit Security**
   - Classic Dispute Kit provides universal fallback
   - Dispute kit compatibility ensures resolution path exists
   - Kit changes require governance approval

## 🔗 Related Components

- `KlerosCore.sol`: Contract for creating and managing courts
- `SortitionModule.sol`: Handles eligibility validation during staking
- `PolicyRegistry.sol`: Manages court policies and defines authoritative court names
- `ICourtEligibility.sol`: Interface for custom eligibility predicates
- Dispute Kit contracts: Implement specific dispute resolution mechanisms