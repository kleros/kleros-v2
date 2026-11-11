import { ContractTransactionReceipt, ContractTransactionResponse } from "ethers";
import { HomeGateway, YahoMock, YaruMock } from "../../typechain-types";

/**
 * Get the messages a Yaho dispatched in a transaction, in order
 * @param receipt The receipt of the transaction
 * @param yaho The Yaho of the leg
 * @returns The messages, as Yaru takes them
 */
export function dispatchedMessages(receipt: ContractTransactionReceipt, yaho: YahoMock) {
  return receipt.logs
    .filter((log) => log.address === yaho.target)
    .map((log) => yaho.interface.parseLog(log))
    .filter((event) => event?.name === "MessageDispatched")
    .map((event) => {
      // Not `toObject(true)`, which turns a one-element array into `{ _: element }`.
      const message = event!.args.message;
      return {
        nonce: message.nonce,
        targetChainId: message.targetChainId,
        threshold: message.threshold,
        sender: message.sender,
        receiver: message.receiver,
        data: message.data,
        reporters: [...message.reporters],
        adapters: [...message.adapters],
      };
    });
}

/**
 * Execute on the other leg's Yaru every message a Yaho dispatched in a transaction, as a relayer does once the
 * adapters hold the message hashes (the fixture's reporters store them during the dispatch)
 * @param tx The transaction that dispatched the messages
 * @param yaho The Yaho of the source leg
 * @param yaru The Yaru of the target leg
 * @returns The Yaru transaction
 */
export async function relayMessages(
  tx: ContractTransactionResponse,
  yaho: YahoMock,
  yaru: YaruMock
): Promise<ContractTransactionResponse> {
  const receipt = await tx.wait();
  if (!receipt) throw new Error("No receipt for the dispatching transaction");
  const messages = dispatchedMessages(receipt, yaho);
  if (messages.length === 0) throw new Error("No message dispatched by this Yaho");
  return yaru.executeMessages(messages);
}

/**
 * Create on the arbitrator, as anyone can, the dispute a HomeGateway received in a Yaru delivery, with the message of
 * its `DisputeReceived` event
 * @param deliveryTx The Yaru transaction that delivered the dispute
 * @param homeGateway The HomeGateway
 * @returns The `createReceivedDispute` transaction
 */
export async function createReceivedDispute(
  deliveryTx: ContractTransactionResponse,
  homeGateway: HomeGateway
): Promise<ContractTransactionResponse> {
  const receipt = await deliveryTx.wait();
  if (!receipt) throw new Error("No receipt for the delivery");
  const event = receipt.logs
    .filter((log) => log.address === homeGateway.target)
    .map((log) => homeGateway.interface.parseLog(log))
    .find((parsed) => parsed?.name === "DisputeReceived");
  if (!event) throw new Error("No dispute received in this delivery");
  // Field by field, as in `dispatchedMessages`: `toObject(true)` turns a one-element array into `{ _: element }`.
  const message = event.args._message;
  return homeGateway.createReceivedDispute({
    foreignArbitrable: message.foreignArbitrable,
    foreignDisputeID: message.foreignDisputeID,
    choices: message.choices,
    extraData: message.extraData,
    externalDisputeID: message.externalDisputeID,
    templateId: message.templateId,
    templateUri: message.templateUri,
    oracleIDs: [...message.oracleIDs],
    threshold: message.threshold,
  });
}
