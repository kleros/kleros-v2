import { Bytes, ByteArray, BigInt, crypto } from "@graphprotocol/graph-ts";

import {
  FastBridgeSender,
  MessageReceived,
  BatchOutgoing,
  SentSafe,
} from "../generated/FastBridgeSender/FastBridgeSender";
import {
  FastMessage,
  Sender,
  Batch,
  Proof,
  Receiver,
} from "../generated/schema";

export function handleSentSafe(event: SentSafe): void {
  const batch = Batch.load(event.params.epoch.toString());
  if (batch) {
    batch.sentSafe = true;
    batch.canonicalBridgeMessageID = event.params.canonicalBridgeMessageID;
    batch.save();
  }
}

export function handleMessageReceived(event: MessageReceived): void {
  const contract = FastBridgeSender.bind(event.address);

  const batchID = contract.currentBatchID();
  const leafHash = event.params.fastMessageHash;
  const message = event.params.fastMessage;
  const nonce = BigInt.fromByteArray(firstSlotReverse(message));

  const fastMessage = new FastMessage(
    batchID.toString() + "," + nonce.toString()
  );

  fastMessage.message = message;
  fastMessage.hash = leafHash;
  fastMessage.batchID = batchID;
  fastMessage.nonce = nonce;

  const receiverAddress = getAddress(message, 44).toHexString();
  const senderAddress = getAddress(message, 144).toHexString();

  const receiver = new Receiver(receiverAddress);
  receiver.save();

  const sender = new Sender(senderAddress);
  sender.save();

  fastMessage.receiver = receiverAddress;
  fastMessage.sender = senderAddress;
  fastMessage.save();
}

export function handleBatchOutgoing(event: BatchOutgoing): void {
  const layers: ByteArray[][] = [];
  const layerZero: ByteArray[] = [];

  const epochInitial = event.params.batchID;
  const epochFinal = event.params.epoch;
  const batchSize = event.params.batchSize;
  const currentBatchID = event.params.batchID;

  let batch = new Batch(currentBatchID.toString());

  batch.epochFinal = epochFinal;
  batch.batchSize = batchSize;

  let count = 0;
  const _epochFinal = epochFinal.toU32();

  for (let i = epochInitial.toU32(); i <= _epochFinal; i++) {
    let fastMessage = FastMessage.load(i.toString() + "," + count.toString());
    while (fastMessage != null) {
      layerZero.push(fastMessage.hash);
      count++;
      fastMessage = FastMessage.load(i.toString() + "," + count.toString());
    }
  }
  layers.push(layerZero);
  // Get next layer until we reach the root
  while (layers[layers.length - 1].length > 1) {
    layers.push(getNextLayer(layers[layers.length - 1]));
  }

  // PROOF
  for (let idx = 0; idx < layerZero.length; idx++) {
    let proof: ByteArray[] = [];
    let _proof = new Proof(currentBatchID.toString() + "," + idx.toString());
    let _idx = idx;
    for (let i = 0; i < layers.length; i++) {
      const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      if (pairIdx < layers[i].length) {
        proof.push(layers[i][pairIdx]);
      }
      _idx /= 2;
    }
    _proof.data = Bytes.fromByteArray(Flatten(proof));
    _proof.fastMessage = currentBatchID.toString() + "," + idx.toString();
    _proof.batchID = currentBatchID;
    _proof.nonce = BigInt.fromU32(idx);
    _proof.save();
  }
  batch.merkleRoot = event.params.batchMerkleRoot;
  batch.sentSafe = false;
  batch.save();
}

function Flatten(a: ByteArray[]): ByteArray {
  let out = new ByteArray(32 * a.length);
  for (let i = 0; i < a.length; i++) out.set(a[i], i * 32);
  return out;
}

function getNextLayer(elements: ByteArray[]): ByteArray[] {
  return elements.reduce((layer, el, idx, arr) => {
    if (idx % 2 === 0) {
      // Hash the current element with its pair element
      if (idx == arr.length - 1) {
        layer.push(el);
      } else {
        layer.push(crypto.keccak256(concatAndSortByteArrays(el, arr[idx + 1])));
      }
    }

    return layer;
  }, [] as ByteArray[]);
}

function firstSlotReverse(a: ByteArray): ByteArray {
  let out = new ByteArray(32);
  for (let i = 0; i < 32; i++) out[i] = a[31 - i];
  return out;
}

function getAddress(input: ByteArray, offset: i32): ByteArray {
  let out = new ByteArray(20);
  for (let i = 0; i < 20; i++) out[i] = input[i + offset];
  return out;
}

function concatAndSortByteArrays(a: ByteArray, b: ByteArray): ByteArray {
  let out: ByteArray;
  for (let i = 0; i < 32; i++) {
    if (a[i] > b[i]) {
      out = b.concat(a);
      return out;
    } else if (b[i] < a[i]) {
      out = a.concat(b);
      return out;
    }
  }
  return a;
}
