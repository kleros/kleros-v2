import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { toBuffer } from "ethereumjs-util";
import { soliditySha3 } from "web3-utils";
import { MerkleTree } from "./MerkleTree";

/**
 * Adapted from OpenZeppelin MerkleProof contract.
 *
 * @see {https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/cryptography/MerkleProof.sol}
 * @param proof The merkle path from `leaf` to `root`.
 * @param root The root of the merkle tree.
 * @param leaf The leaf node.
 * @return valid Whether the proof is valid or not.
 */
 function verify(proof: string[], root: string, leaf: string) {
  return (
    root ===
    proof.reduce(
      (computedHash: string, proofElement: string, currentIndex: number): string =>
      Buffer.compare(toBuffer(computedHash), toBuffer(proofElement)) <= 0
      ? (soliditySha3(computedHash, proofElement) as string)
      : (soliditySha3(proofElement, computedHash) as string),
      leaf
    )
  );
}

describe("Merkle", function () {
  describe("Sanity tests", async () => {

    let merkleTreeHistory, merkleProof;
    let data,nodes,mt;
    let rootOnChain,rootOffChain, proof;

    before("Deploying", async () => {
      const merkleTreeHistoryFactory = await ethers.getContractFactory("MerkleTreeHistory");
      const merkleProofFactory = await ethers.getContractFactory("MerkleProof");
      merkleTreeHistory = await merkleTreeHistoryFactory.deploy();
      merkleProof = await merkleProofFactory.deploy();
      await merkleTreeHistory.deployed();
      await merkleProof.deployed();
    });

    it("Merkle Root verification", async function () {
      data = [ 
        "0x00",
        "0x01",
        "0x03",
      ];
      nodes = [];
      for (var message of data)  {
        await merkleTreeHistory.append(message);
        nodes.push(MerkleTree.makeLeafNode(message));
      }
      mt = new MerkleTree(nodes);
      rootOffChain = mt.getHexRoot();
      rootOnChain = await merkleTreeHistory.getMerkleRoot();
      expect(rootOffChain == rootOnChain).equal(true);
    });
  it("Should correctly verify all nodes in the tree", async () => {
    for (var message of data)  {
      const leaf = ethers.utils.keccak256(message);
      proof = mt.getHexProof(leaf);
      const validation = await merkleProof.validateProof(proof, message,rootOnChain);
      expect(validation).equal(true);
      expect(verify(proof, rootOffChain, leaf)).equal(true);
    }
    });
  });
});