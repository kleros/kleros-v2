# 👨‍⚖️ Arbitrator V2

## 📋 Overview

The `IArbitratorV2` interface defines the standard interface for arbitration in the Kleros V2 protocol. Unlike its predecessor ERC-792, this standard is not concerned with appeals, allowing each arbitrator to implement an appeal system that best suits its needs.

## 📑 Table of Contents

1. [💫 Typical Flow](#-typical-flow)
   - [Dispute Lifecycle Sequence](#dispute-lifecycle-sequence)
2. [🔄 Court and Dispute Kit Jumps](#-court-and-dispute-kit-jumps)
   - [Jump Flow Diagram](#jump-flow-diagram)
   - [Court Jump Mechanism](#court-jump-mechanism)
   - [Dispute Kit Jump Mechanism](#dispute-kit-jump-mechanism)
3. [📦 Extra Data Format](#-extra-data-format)
   - [Encoding Structure](#1-encoding-structure)
   - [Parameter Details](#2-parameter-details)
   - [Usage Notes](#4-usage-notes)
4. [💰 Fee Token Support](#-fee-token-support)
   - [Payment Methods](#1-payment-methods)
   - [Exchange Rates](#2-exchange-rates)
   - [Implementation Considerations](#3-implementation-considerations)
5. [🔄 Events](#-events)
   - [DisputeCreation](#disputecreation)
   - [Ruling](#ruling)
   - [AcceptedFeeToken](#acceptedfeetoken)
   - [NewCurrencyRate](#newcurrencyrate)
6. [🔧 Core Methods](#-core-methods)
   - [Dispute Creation and Cost Methods](#dispute-creation-and-cost-methods)
     - [createDispute](#createdispute)
     - [createDispute (ERC20)](#createdispute-erc20)
     - [arbitrationCost](#arbitrationcost)
     - [arbitrationCost (ERC20)](#arbitrationcost-erc20)
     - [appealCost](#appealcost)
   - [Staking and Drawing](#staking-and-drawing)
     - [setStake](#setstake)
     - [draw](#draw)
   - [Dispute Lifecycle Management](#dispute-lifecycle-management)
     - [passPeriod](#passperiod)
     - [appeal](#appeal)
     - [execute](#execute)
     - [executeRuling](#executeruling)
   - [Current Ruling](#current-ruling)
     - [currentRuling](#currentruling)
7. [🛡️ Emergency Controls](#-emergency-controls)
   - [Roles and Permissions](#roles-and-permissions)
   - [Pause Mechanism](#pause-mechanism)
   - [Impact of Pausing](#impact-of-pausing)
8. [🔗 Related Components](#-related-components)
9. [🔒 Security Considerations](#-security-considerations)
   - [Fee Management](#1-fee-management)
   - [Dispute Creation](#2-dispute-creation)
   - [Ruling Integrity](#3-ruling-integrity)

## 💫 Typical Flow

1. **Dispute Creation**

   - Arbitrable contract calls `createDispute`
   - Pays arbitration fees (ETH or ERC20)
   - Dispute is created with specified court and parameters
   - Jurors are drawn based on court configuration

2. **Dispute Resolution**

   - Follows court-specific periods:
     1. Evidence submission
     2. Commit (if hidden votes)
     3. Vote
     4. Appeal
     5. Execution

3. **Court and Dispute Kit Jumps**

   - During appeals, disputes can:
     1. Move to parent courts (Court Jump)
     2. Switch dispute resolution mechanisms (Dispute Kit Jump)
   - Triggered when:
     - Number of jurors reaches `jurorsForCourtJump`
     - Parent court doesn't support current dispute kit

4. **Ruling Execution**
   - Final ruling determined through `currentRuling`
   - Ruling executed on arbitrable contract

### Dispute Lifecycle Sequence

```mermaid
sequenceDiagram
    participant Arbitrable
    participant Juror
    participant KlerosCore
    participant DisputeKit
    participant SortitionModule

    Note over Arbitrable,SortitionModule: 1. Dispute Creation
    Arbitrable->>KlerosCore: createDispute(choices, extraData)
    KlerosCore->>SortitionModule: createDisputeHook()
    KlerosCore->>DisputeKit: createDispute()
    KlerosCore-->>KlerosCore: emit DisputeCreation

    Note over Arbitrable,SortitionModule: 2. Evidence Period
    loop Drawing until nbVotes reached
        KlerosCore->>DisputeKit: draw()
        DisputeKit-->>KlerosCore: drawnAddress
        KlerosCore->>SortitionModule: lockStake()
        KlerosCore-->>KlerosCore: emit Draw
    end

    Note over KlerosCore: Check: All jurors drawn & (round > 0 || evidence period passed)
    KlerosCore->>KlerosCore: passPeriod()
    KlerosCore-->>KlerosCore: emit NewPeriod(commit/vote)

    Note over Arbitrable,SortitionModule: 3. Commit Period (if hidden votes)
    loop Until deadline
        Juror->>DisputeKit: castCommit()
        DisputeKit-->>DisputeKit: emit CommitCast
    end

    Note over KlerosCore: Check: Deadline passed || all commits cast
    KlerosCore->>KlerosCore: passPeriod()
    KlerosCore-->>KlerosCore: emit NewPeriod(vote)

    Note over Arbitrable,SortitionModule: 4. Vote Period
    loop Until deadline
        Juror->>DisputeKit: castVote()
        DisputeKit-->>DisputeKit: emit VoteCast
    end

    Note over KlerosCore: Check: Deadline passed || all votes cast
    KlerosCore->>KlerosCore: passPeriod()
    KlerosCore-->>KlerosCore: emit NewPeriod(appeal)
    KlerosCore-->>KlerosCore: emit AppealPossible

    Note over Arbitrable,SortitionModule: 5. Appeal Period
    KlerosCore->>KlerosCore: passPeriod()
    alt Appeal Filed & Fully Funded
        DisputeKit->>KlerosCore: appeal()
        KlerosCore-->>KlerosCore: emit AppealDecision
        opt Court Jump (nbVotes >= jurorsForCourtJump)
            KlerosCore-->>KlerosCore: Switch to parent court
            KlerosCore-->>KlerosCore: emit CourtJump
        end
        opt Dispute Kit Jump (parent court incompatible)
            KlerosCore->>DisputeKit: createDispute() in new DK
            KlerosCore-->>KlerosCore: emit DisputeKitJump
        end
        KlerosCore-->>KlerosCore: emit NewPeriod(evidence)
        Note over Arbitrable,SortitionModule: Return to Evidence Period
    else No Appeal or Appeal Failed
        Note over KlerosCore: Check: Appeal period deadline passed
        KlerosCore->>KlerosCore: passPeriod()
        KlerosCore-->>KlerosCore: emit NewPeriod(execution)
    end

    Note over Arbitrable,SortitionModule: 6. Execution Period
    loop Execute Rewards
        KlerosCore->>DisputeKit: getCoherentCount()
        KlerosCore->>DisputeKit: getDegreeOfCoherence()
        KlerosCore->>SortitionModule: unlockStake()
        KlerosCore-->>KlerosCore: emit TokenAndETHShift
        opt If no coherent votes or residual rewards
            KlerosCore-->>KlerosCore: emit LeftoverRewardSent
        end
    end

    KlerosCore->>KlerosCore: executeRuling()
    KlerosCore-->>KlerosCore: emit Ruling
    KlerosCore->>Arbitrable: rule()
```

The diagram shows:

1. **Dispute Creation**: Arbitrable contract initiates the dispute
2. **Evidence Period**: Jurors are drawn through the dispute kit
   - Requires all jurors to be drawn
   - For first round: evidence period must also have passed
3. **Commit Period**: Hidden votes phase (if enabled)
   - Transitions when deadline passed or all commits cast
4. **Vote Period**: Jurors cast their votes
   - Transitions when deadline passed or all votes cast
5. **Appeal Period**: Possible court/dispute kit jumps if appealed
   - Transitions to execution if deadline passed without successful appeal
   - Returns to evidence if appeal successful
6. **Execution Period**: Rewards distribution and final ruling

Key interactions:

- KlerosCore orchestrates the overall process and emits state change events
- DisputeKit handles voting mechanics and vote-related events
- SortitionModule manages stake operations
- Jurors interact directly with DisputeKit for voting
- Arbitrable contract initiates and receives the final ruling

## 🔄 Court and Dispute Kit Jumps

When a dispute is appealed, it may move to a parent court and/or switch dispute kits. The Classic Dispute Kit (ID: 1) serves as a universal fallback mechanism, being mandatorily supported by all courts to ensure disputes can always be resolved.

### Jump Flow Diagram

```mermaid
graph TD
    A[Dispute in Court N<br/>with Dispute Kit X] -->|Appeal| B{Check Jurors Count}
    B -->|nbVotes >= jurorsForCourtJump| C[Move to Parent Court]
    B -->|nbVotes < jurorsForCourtJump| D[Stay in Current Court]

    C -->|Check DK Support| E{Parent Court<br/>Supports DK X?}
    E -->|Yes| F[Keep Dispute Kit X]
    E -->|No| G[Switch to Classic DK]

    F --> H[New Round in<br/>Parent Court<br/>with DK X]
    G --> I[New Round in<br/>Parent Court<br/>with Classic DK]
    D --> J[New Round in<br/>Court N with DK X]

    style A fill:#fff,stroke:#333
    style B fill:#ff9,stroke:#333
    style C fill:#9cf,stroke:#333
    style D fill:#9cf,stroke:#333
    style E fill:#ff9,stroke:#333
    style F fill:#9cf,stroke:#333
    style G fill:#f99,stroke:#333
    style H fill:#9f9,stroke:#333
    style I fill:#9f9,stroke:#333
    style J fill:#9f9,stroke:#333
```

The diagram shows:

1. Initial dispute state and appeal trigger
2. Court jump decision based on juror count
3. Dispute kit compatibility check
4. Final state after jumps (if any)

### Court Jump Mechanism

When a dispute is appealed and the number of jurors reaches or exceeds the court's `jurorsForCourtJump` threshold:

1. **Trigger Conditions**

   ```solidity
   if (round.nbVotes >= courts[newCourtID].jurorsForCourtJump) {
       newCourtID = courts[newCourtID].parent;
   }
   ```

2. **Jump Process**

   - Dispute moves to parent court
   - New round created with parent court parameters
   - Fees and stakes recalculated based on parent court
   - Emits `CourtJump` event with:
     ```solidity
     event CourtJump(
       uint256 indexed _disputeID,
       uint256 indexed _roundID,
       uint96 indexed _fromCourtID,
       uint96 _toCourtID
     );
     ```

3. **Special Cases**
   - General Court appeals: Reserved for future forking mechanism
   - Forking Court: Cannot be directly used for disputes

### Dispute Kit Jump Mechanism

A dispute kit jump occurs only during a court jump when the parent court doesn't support the current dispute kit:

1. **Trigger Condition**

   ```solidity
   if (!courts[newCourtID].supportedDisputeKits[newDisputeKitID]) {
       newDisputeKitID = DISPUTE_KIT_CLASSIC;
   }
   ```

   - Always defaults to Classic Dispute Kit (ID: 1)
   - Classic Dispute Kit must be supported by all courts

2. **Jump Process**
   - New dispute created in Classic Dispute Kit
   - State transferred to new dispute kit
   - Emits `DisputeKitJump` event:
     ```solidity
     event DisputeKitJump(
       uint256 indexed _disputeID,
       uint256 indexed _roundID,
       uint256 indexed _fromDisputeKitID,
       uint256 _toDisputeKitID
     );
     ```

### 📝 Implementation Notes

1. **Jump Sequence**

   - Court jump evaluated first
   - Dispute kit jump follows if needed
   - Both can occur in same appeal
   - Classic Dispute Kit ensures resolution continuity

2. **State Management**

   - Dispute parameters updated for new court/kit
   - Round information preserved
   - Appeal periods reset
   - Drawing process restarts

3. **Fee Handling**

   ```solidity
   extraRound.nbVotes = msg.value / court.feeForJuror;
   extraRound.pnkAtStakePerJuror = (court.minStake * court.alpha) / ALPHA_DIVISOR;
   extraRound.totalFeesForJurors = msg.value;
   ```

4. **Security Considerations**
   - Validates court existence
   - Ensures dispute kit compatibility
   - Maintains coherent state during transitions
   - Preserves appeal funding

## 📦 Extra Data Format

The `extraData` parameter is a crucial component used in dispute creation and cost calculation. It encodes three key parameters that determine how a dispute will be handled.

### 1. Encoding Structure

```solidity
bytes extraData = abi.encode(
    uint96 courtID,      // Court handling the dispute
    uint256 minJurors,   // Minimum number of jurors
    uint256 disputeKitID // Specific dispute resolution mechanism
);
```

### 2. Parameter Details

**Court ID** (first 32 bytes)

- Type: `uint96`
- Purpose: Identifies which court will handle the dispute
- Validation:
  - If `courtID == FORKING_COURT` → defaults to `GENERAL_COURT`
  - If `courtID >= courts.length` → defaults to `GENERAL_COURT`
  - Must be a valid court that supports the specified dispute kit

**Minimum Jurors** (next 32 bytes)

- Type: `uint256`
- Purpose: Specifies minimum number of jurors required
- Validation:
  - If `minJurors == 0` → defaults to `DEFAULT_NB_OF_JURORS`
- Impact: Directly affects arbitration costs (`feeForJuror * minJurors`)

**Dispute Kit ID** (last 32 bytes)

- Type: `uint256`
- Purpose: Specifies which dispute resolution mechanism to use
- Validation:
  - If `disputeKitID == NULL_DISPUTE_KIT (0)` → defaults to `DISPUTE_KIT_CLASSIC (1)`
  - If `disputeKitID >= disputeKits.length` → defaults to `DISPUTE_KIT_CLASSIC (1)`
  - Must be supported by the selected court

### 4. Usage Notes

- **Encoding**: Always use `abi.encode()` to ensure proper padding and alignment
- **Length Validation**: Implementation handles both complete and incomplete data
- **Default Behavior**:
  - If `extraData` is shorter than expected → all parameters get default values
  - If any parameter is invalid → that parameter gets a default value
  - Other valid parameters are still used
- **Gas Efficiency**: Uses assembly for efficient decoding
- **Safety**: All invalid inputs are handled gracefully with defaults

## 💰 Fee Token Support

The arbitrator supports both native currency (ETH) and ERC20 token payments for arbitration fees.

### 1. Payment Methods

- Native currency (ETH):

  - Always supported as the default payment method
  - Direct value transfer through payable functions
  - **Required for appeal fees**: Appeals must be paid in ETH due to complexity of handling token conversions during court jumps

- ERC20 tokens:
  - Must be explicitly enabled by the governor
  - Acceptance tracked through `AcceptedFeeToken` events
  - Requires approval before dispute creation
  - Not supported for appeal fees

### 2. Exchange Rates

- Rate Management:

  - Maintained by the governor
  - Defined as `(rateInEth, rateDecimals)` pairs
  - Updates tracked through `NewCurrencyRate` events

- Cost Conversion:
  ```solidity
  tokenAmount = (ethAmount * 10^rateDecimals) / rateInEth
  ```

### 3. Implementation Considerations

- Rate Maintenance:

  - Regular updates to reflect market prices
  - Balance between accuracy and gas costs
  - Consider price oracle integration

- Token Integration:

  - Proper decimal handling in conversions
  - SafeERC20 usage for transfers
  - Clear documentation of supported tokens

- Security:
  - Rate manipulation protection
  - Token approval safety
  - Reentrance protection in fee payments

## 🔄 Events

### DisputeCreation

```solidity
event DisputeCreation(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable)
```

- Emitted when a new dispute is created
- Parameters:
  - `_disputeID`: Unique identifier for the dispute
  - `_arbitrable`: Contract which created the dispute

### Ruling

```solidity
event Ruling(IArbitrableV2 indexed _arbitrable, uint256 indexed _disputeID, uint256 _ruling)
```

- Emitted when a ruling is given
- Parameters:
  - `_arbitrable`: Contract receiving the ruling
  - `_disputeID`: Identifier of the dispute
  - `_ruling`: The ruling value

### AcceptedFeeToken

```solidity
event AcceptedFeeToken(IERC20 indexed _token, bool indexed _accepted)
```

- Emitted when an ERC20 token is added/removed as a payment method
- Parameters:
  - `_token`: The ERC20 token
  - `_accepted`: Whether the token is accepted

### NewCurrencyRate

```solidity
event NewCurrencyRate(IERC20 indexed _feeToken, uint64 _rateInEth, uint8 _rateDecimals)
```

- Emitted when fee rates for an ERC20 token are updated
- Parameters:
  - `_feeToken`: The ERC20 token
  - `_rateInEth`: New rate in ETH
  - `_rateDecimals`: Decimals for the rate

## 🔧 Core Methods

### Dispute Creation and Cost Methods

#### createDispute

```solidity
function createDispute(
    uint256 _numberOfChoices,
    bytes calldata _extraData
) external payable returns (uint256 disputeID)
```

- Creates a dispute with native currency payment (typically ETH)
- Parameters:
  - `_numberOfChoices`: Number of ruling options
  - `_extraData`: Additional dispute data containing:
    - Court ID (first 32 bytes)
    - Minimum jurors required (next 32 bytes)
    - Dispute kit ID (last 32 bytes)
- Returns: Unique identifier for the created dispute
- Requirements:
  - Must be called by the arbitrable contract
  - Payment must be >= `arbitrationCost(_extraData)`

#### createDispute (ERC20)

```solidity
function createDispute(
    uint256 _numberOfChoices,
    bytes calldata _extraData,
    IERC20 _feeToken,
    uint256 _feeAmount
) external returns (uint256 disputeID)
```

- Creates a dispute with ERC20 token payment
- Additional Parameters:
  - `_feeToken`: ERC20 token used for payment
  - `_feeAmount`: Amount of tokens to pay
- Requirements:
  - Token must be accepted for fee payment
  - Amount must be >= `arbitrationCost(_extraData, _feeToken)`

#### arbitrationCost

```solidity
function arbitrationCost(bytes calldata _extraData) external view returns (uint256 cost)
```

- Computes arbitration cost in native currency
- In KlerosCoreBase: Cost = `feeForJuror * minJurors`
- Note: Changes should be infrequent due to gas costs for arbitrable contracts

#### arbitrationCost (ERC20)

```solidity
function arbitrationCost(
    bytes calldata _extraData,
    IERC20 _feeToken
) external view returns (uint256 cost)
```

- Computes arbitration cost in specified ERC20 token
- Uses currency rates to convert from native currency cost

#### appealCost

```solidity
function appealCost(uint256 _disputeID) public view returns (uint256 cost)
```

- Gets the cost of appealing a specified dispute
- Cost calculation:
  - If staying in current court: `feeForJuror * ((nbVotes * 2) + 1)`
  - If jumping to parent court: uses parent court's `feeForJuror`
  - If appealing in General Court: returns non-payable amount (reserved for future forking mechanism)
- Cost increases exponentially with each appeal to discourage frivolous appeals
- **Important**: Appeal fees must always be paid in ETH (native currency) due to complexity of handling token conversions during court jumps

### Staking and Drawing

#### setStake

```solidity
function setStake(uint96 _courtID, uint256 _newStake) external whenNotPaused
```

- Allows jurors to stake/unstake PNK in courts
- Delegated to `SortitionModule` which:
  - Manages the sortition trees for each court
  - Handles stake transitions and delayed stakes
  - Tracks total staked amounts
  - Ensures proper stake accounting
- Requirements:
  - System must not be paused
  - Stake amount must meet court's minimum requirement
  - Court must be valid (not Forking Court)

#### draw

```solidity
function draw(uint256 _disputeID, uint256 _iterations) external
```

- Draws jurors for a dispute during evidence period
- Delegated to the dispute kit associated with the dispute
- Can be called in parts through `_iterations` parameter
- For each successful draw:
  - Locks juror's PNK stake as collateral
  - Emits `Draw` event
  - Updates round information

### Dispute Lifecycle Management

#### passPeriod

```solidity
function passPeriod(uint256 _disputeID) external
```

- Advances dispute to next period when conditions are met
- Period sequence: evidence → commit → vote → appeal → execution
- Each transition has specific requirements:
  - Evidence: All jurors must be drawn
  - Commit: All commits must be cast (if hidden votes)
  - Vote: All votes must be cast
  - Appeal: Appeal period must have passed
  - Execution: Final state

#### appeal

```solidity
function appeal(uint256 _disputeID, uint256 _numberOfChoices, bytes memory _extraData) external payable
```

- Handles appeals of dispute rulings
- Delegated to the dispute kit for appeal validation
- Manages:
  - Court jumps when juror count threshold is reached
  - Dispute kit jumps when parent court compatibility requires
  - Creation of new rounds
  - Fee payments and stake calculations

#### execute

```solidity
function execute(uint256 _disputeID, uint256 _round, uint256 _iterations) external whenNotPaused
```

- Distributes PNK stakes and dispute fees to jurors
- Can be called in parts through `_iterations`
- Handles:
  - PNK penalties for incoherent votes
  - Fee distribution to coherent jurors
  - Reward calculations based on vote coherence
  - Leftover reward distribution

#### executeRuling

```solidity
function executeRuling(uint256 _disputeID) external
```

- Finalizes dispute by executing the ruling
- Can only be called in execution period
- Ensures:
  - Dispute is in execution period
  - Ruling hasn't been executed before
- Emits final ruling and calls arbitrable contract

### Current Ruling

#### currentRuling

```solidity
function currentRuling(
    uint256 _disputeID
) external view returns (uint256 ruling, bool tied, bool overridden)
```

- Gets current ruling for a dispute
- Returns:
  - `ruling`: Current ruling value
  - `tied`: Whether there's a tie
  - `overridden`: Whether ruling was overridden by appeal funding

These methods work together to enable:

1. Juror selection through secure stake-weighted randomization
2. Multi-round dispute resolution with appeals
3. Economic incentives through coherence-based rewards
4. Seamless transitions between courts and dispute kits

## 🛡️ Emergency Controls

The Kleros V2 protocol implements an emergency control system that allows rapid response to potential security threats while maintaining a balance between security and decentralization.

### Roles and Permissions

1. **Guardian**

   - Focused security role with limited permissions
   - Can pause the system in emergencies
   - Currently set to a multisig contract for quick response
   - Cannot unpause the system (requires governor)
   - Cannot modify system parameters

2. **Governor**
   - Administrative role with broader permissions
   - Can both pause and unpause the system
   - Can change system parameters
   - Can execute governance proposals
   - Can change both guardian and governor addresses
   - Currently set to a multisig contract distinct from the guardian
   - Planned to transition to DAO control via the KlerosGovernor contract, following the governance model of Kleros v1

### Pause Mechanism

The pause mechanism is implemented through two key functions:

```solidity
function pause() external onlyByGuardianOrGovernor whenNotPaused
function unpause() external onlyByGovernor whenPaused
```

Key characteristics:

- Pausing can be triggered by either guardian or governor
- Only the governor can unpause the system
- State changes emit corresponding events:
  ```solidity
  event Paused();
  event Unpaused();
  ```
- Prevents duplicate pause/unpause calls through state checks

### Impact of Pausing

When the system is paused:

1. **Blocked Operations**

   - Staking operations (`setStake`)
   - Reward execution and distribution (`execute`)
   - Any operation marked with `whenNotPaused` modifier

2. **Allowed Operations**
   - Dispute creation remains active
   - Voting continues to function
   - Core dispute resolution remains operational
   - Appeal mechanisms stay active

This selective pausing ensures that while potentially vulnerable economic operations can be halted, the core arbitration functionality remains available to users.

The pause mechanism serves as a critical security control that:

- Provides rapid response capability to security events
- Protects user assets during emergencies
- Maintains essential dispute resolution services
- Ensures controlled recovery through governor-only unpause

## 🔗 Related Components

- `IArbitrableV2`: Interface for contracts that can be arbitrated
- `KlerosCoreBase`: Reference implementation of the arbitrator interface
- Dispute Kits:
  - `DisputeKitClassic`: Default implementation with proportional drawing to staked PNK and plurality voting. Mandatorily supported by all courts as a fallback mechanism.
  - `DisputeKitSybilResistant`: Variant requiring Proof of Humanity registration for drawing
  - `DisputeKitGated`: Variant requiring token holdings (ERC20/721/1155) for drawing
  - More dispute kits can be implemented to support different voting mechanisms, but courts must always support the Classic Dispute Kit
- `EvidenceModule`: Handles submission and tracking of evidence for disputes
- `SortitionModule`: Manages juror selection and stake tracking using sortition trees

## 🔒 Security Considerations

1. **Fee Management**

   - Arbitration costs should change infrequently:
     - Frequent changes force arbitrable contracts to update their stored fees
     - Each update costs significant gas for arbitrable contracts
     - Changes can make pending transactions invalid if fees increase
   - Cost calculation must be deterministic and consistent
   - ERC20 rates must be carefully maintained to ensure fair fee conversion

2. **Dispute Creation**

   - Only arbitrable contracts can create disputes
   - Fees must be paid upfront
   - Extra data validation is critical

3. **Ruling Integrity**
   - Rulings are final once executed
   - Appeal system must be robust
   - Tied votes must be handled consistently

## ⚙️ Core Functions

The KlerosCore contract delegates key functionality to specialized modules while maintaining the orchestration of the dispute lifecycle.
