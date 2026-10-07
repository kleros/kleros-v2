# 🛠️ Classic Dispute Kit Specification

## 📋 Overview

The Classic Dispute Kit (`DisputeKitClassic`) is the default dispute resolution mechanism in Kleros V2. It implements four core features that define how jurors are selected, how votes are counted, how rewards are distributed, and how appeals work.

Other dispute kits may implement these features differently to support various dispute resolution mechanisms.

## 📑 Table of Contents

1. [🎯 Core Features](#-core-features)
   - [Drawing System: Proportional to Staked PNK](#1-drawing-system-proportional-to-staked-pnk)
     - [Mechanism](#mechanism)
     - [Implementation Notes](#implementation-notes)
     - [Drawing Flow](#drawing-flow)
   - [Vote Aggregation: Plurality Voting](#2-vote-aggregation-plurality-voting)
     - [Mechanism](#mechanism-1)
     - [Vote Weight](#vote-weight)
   - [Incentive System: Equal Split Among Coherent Votes](#3-incentive-system-equal-split-among-coherent-votes)
     - [Reward Sources](#reward-sources)
     - [Distribution Rules](#distribution-rules)
     - [Coherence Calculation](#coherence-calculation)
   - [Appeal System: Binary Funding with Free Choice](#4-appeal-system-binary-funding-with-free-choice)
     - [Appeal Mechanism](#appeal-mechanism)
     - [Appeal Funding](#appeal-funding)
     - [Appeal Outcomes](#appeal-outcomes)
2. [📢 Events](#-events)
   - [Standard Events (IDisputeKit)](#standard-events-idisputekit)
     - [VoteCast](#votecast)
   - [Classic Dispute Kit Events](#classic-dispute-kit-events)
     - [1. Dispute Creation and Setup](#1-dispute-creation-and-setup)
     - [2. Appeal Funding Events](#2-appeal-funding-events)
   - [Event Usage Patterns](#event-usage-patterns)
3. [🔧 Important Methods](#-important-methods)
   - [Juror Methods](#juror-methods)
     - [castCommit](#castcommit)
     - [castVote](#castvote)
   - [Appeal Methods](#appeal-methods)
     - [fundAppeal](#fundappeal)
   - [Maintenance Methods](#maintenance-methods)
     - [withdrawFeesAndRewards](#withdrawfeesandrewards)
   - [Arbitrator-Permissioned Methods](#arbitrator-permissioned-methods)
     - [createDispute](#createdispute)
     - [draw](#draw)
4. [📝 Implementation Notes](#-implementation-notes)
   - [Efficiency](#1-efficiency)
   - [Upgradeability](#2-upgradeability)
   - [Integration](#3-integration)
5. [🔒 Security Considerations](#-security-considerations)
   - [Drawing Fairness](#1-drawing-fairness)
   - [Vote Integrity](#2-vote-integrity)
   - [Reward Distribution](#3-reward-distribution)
   - [Appeal Safety](#4-appeal-safety)

## 🎯 Core Features

### 1. Drawing System: Proportional to Staked PNK

The drawing system determines how jurors are selected for a dispute.

#### Mechanism

- Probability of being drawn is proportional to staked PNK
- Each juror's chance = (Juror's Staked PNK) / (Total Court's Staked PNK)
- Multiple draws per juror are possible in the same dispute

#### Implementation Notes

- Drawing is delegated to the `SortitionModule` contract which:
  - Maintains sortition trees for efficient random selection
  - Tracks staked PNK values for each court
  - Handles the actual juror selection algorithm
  - Ensures proper stake accounting and locking
- Drawing happens during the evidence period
- Drawn jurors must lock additional PNK as collateral
- Failed draws (inactive jurors) are skipped and redrawn

#### Drawing Flow

1. `KlerosCore` initiates the drawing process
2. For each draw:
   - DisputeKit calls `SortitionModule.draw()` with:
     - `courtID`: Court ID as uint96
     - `coreDisputeID`: Dispute identifier
     - `nonce`: Current draw iteration
   - SortitionModule:
     - Uses RNG to select a random position in the tree
     - Returns the drawn juror's address
   - DisputeKit:
     - Validates the drawn juror (stake, not drawn before if required)
     - Creates a new vote instance if valid
     - Requests a redraw if invalid

### 2. Vote Aggregation: Plurality Voting

The vote aggregation system determines how individual votes are combined into a final ruling.

#### Mechanism

- Each juror gets one vote per draw
- The choice with the most votes wins
- In case of a tie: refuse to arbitrate (choice 0)

#### Vote Weight

- All votes have equal weight
- No quadratic voting or other weighted schemes
- Multiple draws = multiple equal votes

### 3. Incentive System: Equal Split Among Coherent Votes

The incentive system determines how rewards (both fees and PNK) are distributed.

#### Reward Sources

- Arbitration Fees: Paid by the arbitrable contract
- PNK Penalties: Collected from incoherent voters

#### Distribution Rules

- Only coherent jurors receive rewards
- Equal split among all coherent votes
- Two types of rewards:
  1. Arbitration Fees
     - Split proportionally to coherence
     - `jurorReward = (availableFeeAmount * coherence) / ONE_BASIS_POINT;`
  2. PNK Redistribution
     - Penalties from incoherent votes are redistributed
     - `pnkReward = (availablePnkAmount * coherence) / ONE_BASIS_POINT`

#### Coherence Calculation

- Full coherence (100%): Voted for winning choice
- Partial coherence: Based on vote's relationship to final outcome
- Zero coherence: Voted for losing choice or didn't vote
- `coherence` ranges from 0 to 10000 (basis points)

### 4. Appeal System: Binary Funding with Free Choice

The appeal system determines how disputes can be appealed and funded.

#### Appeal Mechanism

- Only two choices can be funded for appeal
- Any choice can be voted on in the next round
- Appeal period starts after voting ends

#### Appeal Funding

- Requires full funding of two distinct choices, typically:
  1. The losing choice
  2. The winning choice (counter-funding)
- Funding must cover fees for next round:
  - Number of jurors normally increases to 2n + 1 jurors
  - Fee per juror depends on the destination court
- Both sides must be fully funded for appeal to proceed

#### Appeal Outcomes

- Two distinct choices fully funded: the appeal proceeds.
- Exactly one choice fully funded: that choice wins, even if it lost the vote.
- No choices fully funded: the voting result stands.

## 📢 Events

### Standard Events (IDisputeKit)

All dispute kits must implement these standard events defined in `IDisputeKit`:

#### `VoteCast`

Emitted when a juror casts their vote, providing transparency about voting choices and their justification.

```solidity
event VoteCast(
  uint256 indexed _coreDisputeID,
  address indexed _juror,
  uint256[] _voteIDs,
  uint256 indexed _choice,
  string _justification
);
```

Parameters:

- `_coreDisputeID`: Dispute identifier in the Arbitrator contract
- `_juror`: Address of the voting juror
- `_voteIDs`: Array of vote IDs being cast
- `_choice`: Selected choice (0 = refuse to arbitrate, 1+ = ruling options)
- `_justification`: Text explaining the juror's decision

### Classic Dispute Kit Events

Events specific to the Classic implementation, supporting its unique features:

#### 1. Dispute Creation and Setup

##### `DisputeCreation`

Emitted when a new dispute is created in the dispute kit.

```solidity
event DisputeCreation(uint256 indexed _coreDisputeID, uint256 _numberOfChoices);
```

Parameters:

- `_coreDisputeID`: Dispute identifier in the Arbitrator contract
- `_numberOfChoices`: Number of available ruling choices

##### `CommitCast`

Emitted during the commit phase when a juror submits their vote commitment.

```solidity
event CommitCast(uint256 indexed _coreDisputeID, address indexed _juror, uint256[] _voteIDs, bytes32 _commit);
```

Parameters:

- `_coreDisputeID`: Dispute identifier
- `_juror`: Address of the committing juror
- `_voteIDs`: Array of vote IDs being committed
- `_commit`: Hash of the committed vote `keccak256(abi.encodePacked(_choice, _jurorAddress, _salt))`

#### 2. Appeal Funding Events

##### `Contribution`

Emitted when someone contributes ETH to fund an appeal for a specific choice.

```solidity
event Contribution(
  uint256 indexed _coreDisputeID,
  uint256 indexed _coreRoundID,
  uint256 _choice,
  address indexed _contributor,
  uint256 _amount
);
```

Parameters:

- `_coreDisputeID`: Dispute identifier
- `_coreRoundID`: Round number in the dispute
- `_choice`: Choice being funded (0 = refuse to arbitrate, 1+ = ruling options)
- `_contributor`: Address making the contribution
- `_amount`: Amount of ETH contributed

##### `ChoiceFunded`

Emitted when a choice receives full funding required for appeal.

```solidity
event ChoiceFunded(uint256 indexed _coreDisputeID, uint256 indexed _coreRoundID, uint256 indexed _choice);
```

Parameters:

- `_coreDisputeID`: Dispute identifier
- `_coreRoundID`: Round number in the dispute
- `_choice`: Choice that has been fully funded

##### `Withdrawal`

Emitted when a contributor withdraws their appeal funding contribution.

```solidity
event Withdrawal(
  uint256 indexed _coreDisputeID,
  uint256 _choice,
  address indexed _contributor,
  uint256 _amount
);
```

Parameters:

- `_coreDisputeID`: Dispute identifier
- `_choice`: Choice the contribution was made for
- `_contributor`: Address receiving the withdrawal
- `_amount`: Amount of ETH withdrawn

### Event Usage Patterns

1. **Dispute Lifecycle Events**

   - `DisputeCreation`: Start of a new dispute
   - `CommitCast`: Commit phase voting
   - `VoteCast`: Reveal phase or direct voting

2. **Appeal Funding Flow**

   - `Contribution`: During appeal funding period
   - `ChoiceFunded`: When a choice reaches full funding
   - `Withdrawal`: After dispute resolution or failed appeal

3. **Event Indexing**
   - `_coreDisputeID`: Always indexed for efficient dispute filtering
   - `_juror`/`_contributor`: Indexed for user-specific queries
   - `_choice`/`_coreRoundID`: Indexed where relevant for specific filtering

## 🔧 Important Methods

### Juror Methods

These functions can be called by external actors according to their roles in the dispute resolution process.

#### castCommit

```solidity
function castCommit(
    uint256 _coreDisputeID,
    uint256[] calldata _voteIDs,
    bytes32 _commit
) external
```

- Called by jurors during the commit period
- Allows jurors to submit their vote commitments
- Parameters:
  - `_coreDisputeID`: Dispute identifier
  - `_voteIDs`: Array of vote IDs to commit for
  - `_commit`: Hash of the vote choice, juror address and salt
- Requirements:
  - Must be in commit period
  - Caller must own the votes
  - Commit must not be empty
- Can be called multiple times to update commits

#### castVote

```solidity
function castVote(
    uint256 _coreDisputeID,
    uint256[] calldata _voteIDs,
    uint256 _choice,
    uint256 _salt,
    string memory _justification
) external
```

- Called by jurors during the vote period
- Reveals votes for courts with hidden votes or casts direct votes
- Parameters:
  - `_coreDisputeID`: Dispute identifier
  - `_voteIDs`: Array of vote IDs to cast
  - `_choice`: Selected ruling option
  - `_salt`: Salt used in commit (for hidden votes)
  - `_justification`: Explanation of the decision
- Requirements:
  - Must be in vote period
  - Caller must own the votes
  - Choice must be valid
  - For hidden votes, commit must match

### Appeal Methods

#### fundAppeal

```solidity
function fundAppeal(uint256 _coreDisputeID, uint256 _choice) external payable
```

- Called by anyone to fund an appeal
- Manages appeal funding contributions in ETH
- Parameters:
  - `_coreDisputeID`: Dispute identifier
  - `_choice`: Ruling option to fund
- Key features:
  - Winners pay 2x appeal cost, including the deposit
  - Losers pay 3x appeal cost, including the deposit
  - Losers have half the funding period
  - Appeal proceeds when two choices are funded
  - Excess contributions are reimbursed

### Maintenance Methods

#### withdrawFeesAndRewards

```solidity
function withdrawFeesAndRewards(
    uint256 _coreDisputeID,
    address payable _beneficiary,
    uint256 _choice
) external returns (uint256 amount)
```

- Maintenance function to withdraw appeal fees and rewards
- Called after dispute resolution
- Parameters:
  - `_coreDisputeID`: Dispute identifier
  - `_beneficiary`: Address to receive the withdrawal
  - `_choice`: Ruling option funded
- Returns amount withdrawn
- Handles various scenarios:
  - Refunds for unsuccessful funding
  - Rewards for funding winning choice
  - Refunds when winning choice wasn't funded

### Arbitrator-Permissioned Methods

These functions are restricted to core arbitrator components.

#### createDispute

```solidity
function createDispute(
    uint256 _coreDisputeID,
    uint256 _coreRoundID,
    uint256 _numberOfChoices
) external
```

- Called only by KlerosCore
- Creates local dispute instance
- Sets up initial round
- Parameters:
  - `_coreDisputeID`: Dispute identifier
  - `_coreRoundID`: Round identifier
  - `_numberOfChoices`: Available ruling options

#### draw

```solidity
function draw(
    uint256 _coreDisputeID,
    uint256 _nonce,
    uint256 _roundNbVotes
) external returns (address drawnAddress, uint96 fromSubcourtID)
```

- Called only by KlerosCore
- Draws jurors using sortition tree
- Parameters:
  - `_coreDisputeID`: Dispute identifier
  - `_nonce`: Drawing iteration
  - `_roundNbVotes`: Number of votes in this round.
- Returns drawn juror's address
- Returns the subcourt ID from which the juror was drawn
- Validates juror eligibility:
  - Juror actually staked in the drawn court
  - Not already drawn (if enabled)
  - Active status

## 📝 Implementation Notes

1. **Efficiency**

   - Uses batch operations where possible
   - Optimizes gas usage in reward distribution
   - Implements efficient vote counting

2. **Upgradeability**

   - Follows Transparent proxy pattern
   - Maintains clean upgrade path
   - Preserves dispute state across upgrades

3. **Integration**
   - Compatible with all court configurations
   - Supports both commit-reveal and direct voting

## 🔒 Security Considerations

1. **Drawing Fairness**

   - Random number generation must be secure
   - Stake changes during drawing must be prevented
   - Tree updates must maintain proportionality

2. **Vote Integrity**

   - Votes must be properly counted
   - Ties must be handled consistently
   - Vote weights must be accurately tracked

3. **Reward Distribution**

   - All rewards must be accounted for
   - No double-claiming of rewards
   - Proper handling of edge cases (zero coherent votes)

4. **Appeal Safety**
   - Appeal funding must be atomic
   - Refunds must be guaranteed
   - Deadlines must be enforced
