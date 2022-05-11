// Shamelessly adapted from OpenZeppelin-contracts test utils
import { keccak256, bufferToHex, toBuffer } from "ethereumjs-util";
import { soliditySha3, Mixed } from "web3-utils";
import { ethers } from "hardhat";
import { soliditySha256 } from "ethers/lib/utils";


const isNil = (value: unknown): boolean => value === null || value === undefined;

// Merkle tree called with 32 byte hex values
export class MerkleTree {
  private elements: Buffer[];
  private layers: Buffer[][];

  /**
   * Creates a Merkle Tree from an array of hex strings.
   * @param leafNodes An array of 32-byte hex strings.
   */
  constructor(leafNodes: string[]) {
    // Deduplicate elements
    this.elements = leafNodes.reduce((acc, el) => (isNil(el) ? acc : [...acc, toBuffer(el)]), [] as Buffer[]);

    // Create layers
    this.layers = MerkleTree.getLayers(this.elements);
  }

  /**
   * Creates a leaf node from any number of args.
   * This is the equivalent of `keccak256(abi.encodePacked(first, ...rest))` on Solidity.
   * @param data The data to be transformed into a node.
   * @return node The `sha3` (A.K.A. `keccak256`) hash of `first, ...params` as a 32-byte hex string.
   */
  public static makeLeafNode(data: string): string {
    const result = ethers.utils.keccak256(data);

    if (!result) {
      throw new Error("Leaf node must not be empty");
    }

    return result;
  }

  /**
   * Deduplicates buffers from an element
   * @param elements An array of buffers containing the leaf nodes.
   * @return dedupedElements The array of buffers without duplicates.
   */
  private static bufDedup(elements: Buffer[]): Buffer[] {
    return elements.filter((el, idx) => {
      return idx === 0 || !elements[idx - 1].equals(el);
    });
  }

  /**
   * Gets the layers of the Merkle Tree by combining the nodes 2-by-2 until the root.
   * @param elements An array of buffers containing the leaf nodes.
   * @returns layers The layers of the merkle tree
   */
  private static getLayers(elements: Buffer[]): Buffer[][] {
    if (elements.length === 0) {
      return [[Buffer.from("")]];
    }

    const layers: Buffer[][] = [];
    layers.push(elements);

    // Get next layer until we reach the root
    while (layers[layers.length - 1].length > 1) {
      layers.push(MerkleTree.getNextLayer(layers[layers.length - 1]));
    }

    return layers;
  }

  /**
   * Gets the next layers of the Merkle Tree.
   * @param elements An array of buffers containing the nodes.
   * @returns layer The next layer of the merkle tree.
   */
  private static getNextLayer(elements: Buffer[]): Buffer[] {
    return elements.reduce((layer, el, idx, arr) => {
      if (idx % 2 === 0) {
        // Hash the current element with its pair element
        const item = MerkleTree.combinedHash(el, arr[idx + 1]);
        if (item) {
          layer.push(item);
        }
      }

      return layer;
    }, [] as Buffer[]);
  }

  /**
   * Gets the hash of the combination of 2 nodes.
   * @param first The first element.
   * @param second The second element.
   * @returns hash The next layer of the merkle tree.
   */
  private static combinedHash(first: null, second: null): null;
  private static combinedHash(first: Buffer | null, second: Buffer): Buffer;
  private static combinedHash(first: Buffer, second: Buffer | null): Buffer;
  private static combinedHash(first: Buffer | null, second: Buffer | null): Buffer | null {
    if (!first) {
      return second;
    }
    if (!second) {
      return first;
    }

    return keccak256(MerkleTree.sortAndConcat(first, second));
  }

  /**
   * Sorts and concatenates an arbitrary number of buffers
   * @param ...args The buffers to sort and concat.
   * @returns concatedBuffer The concatenated buffer.
   */
  private static sortAndConcat(...args: Buffer[]): Buffer {
    return Buffer.concat([...args].sort(Buffer.compare));
  }

  /**
   * Gets the root of the merkle tree.
   * @return root The merkle root as a Buffer.
   */
  public getRoot(): Buffer {
    return this.layers[this.layers.length - 1][0];
  }

  /**
   * Gets the merkle proof for a given element.
   * @param el The element to search for the proof.
   * @return proof The merkle proof.
   */
  public getProof(el: Buffer): Buffer[] {
    let idx = MerkleTree.bufIndexOf(el, this.elements);

    if (idx === -1) {
      throw new Error("Element does not exist in the merkle tree");
    }

    return this.layers.reduce((proof, layer) => {
      const pairElement = MerkleTree.getPairElement(idx, layer);

      if (pairElement) {
        proof.push(pairElement);
      }

      idx = Math.floor(idx / 2);

      return proof;
    }, []);
  }

  /**
   * Gets the merkle proof for a given element.
   * @param el The element to search for the proof.
   * @return pos The position of the element in the array or -1 if not found.
   */
  private static bufIndexOf(el: Buffer, arr: Buffer[]): number {
    let hash;

    // Convert element to 32 byte hash if it is not one already
    if (el.length !== 32) {
      hash = keccak256(el);
    } else {
      hash = el;
    }

    for (let i = 0; i < arr.length; i++) {
      if (hash.equals(arr[i])) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Gets the related pair element from the given layer.
   * @param idx The index of the element.
   * @param layer The layer of the merkle tree.
   * @return pairEl The pair element.
   */
  private static getPairElement(idx: number, layer: Buffer[]): Buffer | null {
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;

    if (pairIdx < layer.length) {
      return layer[pairIdx];
    } else {
      return null;
    }
  }

  /**
   * Gets the root of the merkle tree as hex.
   * @return The merkle root as a 0x-prefixed 32-byte hex string.
   */
  public getHexRoot(): string {
    return bufferToHex(this.getRoot());
  }

  /**
   * Gets the merkle proof for a given element as a 32-byte hex string.
   * @param el The element to search for the proof.
   * @return proof The merkle proof as an array of 32-byte hex strings.
   */
  public getHexProof(el: string): string[] {
    const proof = this.getProof(toBuffer(el));

    return MerkleTree.bufArrToHexArr(proof);
  }

  /**
   * Converts an array of buffers to an array of 0x-prefixed 32-byte strings.
   * @param arr The array of buffers.
   * @return hexArr The array of string.
   */
  private static bufArrToHexArr(arr: Buffer[]): string[] {
    if (arr.some((el) => !Buffer.isBuffer(el))) {
      throw new Error("Array is not an array of buffers");
    }

    return arr.map((el) => bufferToHex(el));
  }

  /**
   * Returns the number of leaf nodes in the Merkle Tree.
   * @returns width The tree width.
   */
  public getWidth(): number {
    return this.elements.length;
  }

  /**
   * Returns the number of layers in the Merkle Tree.
   * @returns height The tree height.
   */
  public getHeight(): number {
    return this.layers.length;
  }
}
