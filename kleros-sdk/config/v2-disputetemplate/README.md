# V2 BREAKING CHANGES

## Onchain changes

### IArbitrator

#### The appeal events and functions have been removed

The appeal concerns are deemed implementation-specific so they have been removed from the Arbitrator interface.

The following have been removed from the Arbitrator interface but are available directly on KlerosCore:

```solidity
function appealCost(uint256 _disputeID) external view returns (uint256 cost);

function appealPeriod(uint256 _disputeID) external view returns (uint256 start, uint256 end);
```

The following have been removed entirely:

```solidity
event AppealPossible(uint256 indexed _disputeID, IArbitrableV1 indexed _arbitrable);
event AppealDecision(uint256 indexed _disputeID, IArbitrableV1 indexed _arbitrable);
function appeal(uint256 _disputeID, bytes calldata _extraData) external payable;
```

The appeal requests are now the responsibility of the DisputeKit implementation. For example in the DisputeKitClassic there is now:

```solidity
// DisputeKitClassic.sol
function fundAppeal(uint256 _coreDisputeID, uint256 _choice) payable;

function getFundedChoices(uint256 _coreDisputeID) view returns (uint256[] memory fundedChoices);
```

#### `DisputeStatus` has been removed

It was deemed redundant. An equivalent behavior can be emulated as follow:

```solidity
// for a particular disputeID
(,,IArbitrator.Period period,,) = arbitrator.disputes(disputeID);

if (period < IArbitratorV2.Period.appeal)
    // Do DisputeStatus.Waiting stuffs
else if (_period < IArbitratorV2.Period.execution)
    // Do DisputeStatus.Appealable stuffs
else
    // Do DisputeStatus.Solved stuffs
}
```
