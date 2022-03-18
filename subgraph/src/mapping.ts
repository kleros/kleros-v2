import { BigInt } from "@graphprotocol/graph-ts"
import {
  Kleroscore,
  AppealDecision,
  AppealPossible,
  DisputeCreation,
  Draw,
  NewPeriod,
  StakeSet,
  TokenAndETHShift
} from "../generated/Kleroscore/Kleroscore"
import { ExampleEntity } from "../generated/schema"

export function handleAppealDecision(event: AppealDecision): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity._disputeID = event.params._disputeID
  entity._arbitrable = event.params._arbitrable

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.ALPHA_DIVISOR(...)
  // - contract.MAX_STAKE_PATHS(...)
  // - contract.MIN_JURORS(...)
  // - contract.NON_PAYABLE_AMOUNT(...)
  // - contract.appealCost(...)
  // - contract.appealPeriod(...)
  // - contract.arbitrationCost(...)
  // - contract.areVotesHidden(...)
  // - contract.courts(...)
  // - contract.currentRuling(...)
  // - contract.disputeKits(...)
  // - contract.disputes(...)
  // - contract.getCurrentPeriod(...)
  // - contract.getJurorBalance(...)
  // - contract.getNumberOfRounds(...)
  // - contract.getRoundInfo(...)
  // - contract.getSortitionSumTree(...)
  // - contract.getSortitionSumTreeID(...)
  // - contract.getSubcourtID(...)
  // - contract.getTimesPerPeriod(...)
  // - contract.governor(...)
  // - contract.isRuled(...)
  // - contract.jurorProsecutionModule(...)
  // - contract.pinakion(...)
}

export function handleAppealPossible(event: AppealPossible): void {}

export function handleDisputeCreation(event: DisputeCreation): void {}

export function handleDraw(event: Draw): void {}

export function handleNewPeriod(event: NewPeriod): void {}

export function handleStakeSet(event: StakeSet): void {}

export function handleTokenAndETHShift(event: TokenAndETHShift): void {}
