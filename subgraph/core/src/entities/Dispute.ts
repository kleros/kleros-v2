import { BigInt, ByteArray, crypto, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { KlerosCore, DisputeCreation } from "../../generated/KlerosCore/KlerosCore";
import { Court, Dispute } from "../../generated/schema";
import { ZERO } from "../utils";
import { getAndIncrementPeriodCounter } from "./PeriodIndexCounter";

export function createDisputeFromEvent(event: DisputeCreation): void {
  const disputeID = event.params._disputeID;
  const disputeContractState = KlerosCore.bind(event.address).disputes(disputeID);
  const dispute = new Dispute(disputeID.toString());
  const courtID = disputeContractState.value0.toString();
  dispute.court = courtID;
  dispute.disputeID = disputeID;
  dispute.createdAt = event.block.timestamp;
  dispute.arbitrated = event.params._arbitrable.toHexString();
  dispute.period = "evidence";
  dispute.ruled = false;
  dispute.currentRuling = ZERO;
  dispute.tied = true;
  dispute.overridden = false;
  dispute.lastPeriodChange = event.block.timestamp;
  dispute.lastPeriodChangeBlockNumber = event.block.number;
  dispute.periodNotificationIndex = getAndIncrementPeriodCounter(dispute.period);
  const court = Court.load(courtID);
  if (!court) return;
  dispute.periodDeadline = event.block.timestamp.plus(court.timesPerPeriod[0]);
  dispute.currentRoundIndex = ZERO;
  const roundID = `${disputeID.toString()}-${ZERO.toString()}`;
  dispute.currentRound = roundID;
  dispute.save();

  updateDisputeRequestData(event);
}

const DisputeRequest = "DisputeRequest(address,uint256,uint256,uint256,string)";

const DisputeRequestSignature = crypto.keccak256(ByteArray.fromUTF8(DisputeRequest));

// note : we are using bytes32 in place of string as strings cannot be decoded and it breaks the function.
// It is okay for us, as we are interested in the uint256 in front
// _externalDisputeId,_templateId,_tenplateUri
const DisputeRequestTypestring = "(uint256,uint256,bytes32)";

const CrossChainDisputeIncoming =
  "CrossChainDisputeIncoming(address,uint256,address,uint256,uint256,uint256,uint256,string)";

const CrossChainDisputeIncomingSignature = crypto.keccak256(ByteArray.fromUTF8(CrossChainDisputeIncoming));

// arbitrator, _arbitrableChainId, _externalDisputeId, _templateId, _templateUri
// note : arbitrable is an indexed arg, so it will topic[1]
const CrossChainDisputeIncomingTypestring = "(address,uint256,uint256,uint256,string)";

export const updateDisputeRequestData = (event: DisputeCreation): void => {
  const dispute = Dispute.load(event.params._disputeID.toString());

  if (!dispute) return;

  const receipt = event.receipt;
  if (!receipt) return;

  const logs = receipt.logs;

  // note that the topic at 0th index is always the event signature
  const disputeRequestEventIndex = logs.findIndex((log) => log.topics[0] == DisputeRequestSignature);

  const crossChainDisputeEventIndex = logs.findIndex((log) => log.topics[0] == CrossChainDisputeIncomingSignature);

  if (crossChainDisputeEventIndex !== -1) {
    const crossChainDisputeEvent = logs[crossChainDisputeEventIndex];

    const decoded = ethereum.decode(CrossChainDisputeIncomingTypestring, crossChainDisputeEvent.data);

    if (!decoded) return;

    dispute.isCrossChain = true;
    dispute.arbitrableChainId = decoded.toTuple()[1].toBigInt();
    dispute.externalDisputeId = decoded.toTuple()[2].toBigInt();
    dispute.templateId = decoded.toTuple()[3].toBigInt();
    dispute.save();
    return;
  } else if (disputeRequestEventIndex !== -1) {
    const disputeRequestEvent = logs[disputeRequestEventIndex];

    const decoded = ethereum.decode(DisputeRequestTypestring, disputeRequestEvent.data);
    if (!decoded) return;
    dispute.isCrossChain = false;
    dispute.arbitrableChainId = getChainId(dataSource.network());
    dispute.externalDisputeId = decoded.toTuple()[0].toBigInt();
    dispute.templateId = decoded.toTuple()[1].toBigInt();
    dispute.save();
    return;
  }
};

// workaround, since hashmap don't work in subgraphs
function getChainId(name: string): BigInt {
  if (name == "arbitrum-one") return BigInt.fromI32(42161);
  else if (name == "arbitrum-sepolia") return BigInt.fromI32(421614);
  else return BigInt.fromI32(1);
}
