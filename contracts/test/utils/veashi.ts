import { ContractTransactionReceipt, ContractTransactionResponse } from "ethers";
import { YaruMock, Yaho } from "../../typechain-types";

/**
 * Get the messages a Yaho dispatched in a transaction, in order
 * @param receipt The receipt of the transaction
 * @param yaho The Yaho of the leg
 * @returns The messages, as Yaru takes them
 */
export function dispatchedMessages(receipt: ContractTransactionReceipt, yaho: Yaho) {
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
  yaho: Yaho,
  yaru: YaruMock
): Promise<ContractTransactionResponse> {
  const receipt = await tx.wait();
  if (!receipt) throw new Error("No receipt for the dispatching transaction");
  const messages = dispatchedMessages(receipt, yaho);
  if (messages.length === 0) throw new Error("No message dispatched by this Yaho");
  return yaru.executeMessages(messages);
}
