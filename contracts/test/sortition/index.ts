import { expect } from "chai";
import { ethers } from "hardhat";
import { SortitionTreesMock } from "../../typechain-types";

describe("SortitionTrees", function () {
  let sortitionTree: SortitionTreesMock;
  let accounts: any[];

  beforeEach("Setup", async () => {
    const factory = await ethers.getContractFactory("SortitionTreesMock");
    sortitionTree = (await factory.deploy()) as SortitionTreesMock;
    accounts = await ethers.getSigners();
  });

  // Helper function to create a test juror address
  const getTestAddress = (index: number): string => accounts[index % accounts.length].address;

  describe("Stake Path ID Utilities", function () {
    it("Should convert correctly between stakePathID and account+courtID", async function () {
      // Test various combinations of addresses and court IDs
      const testCases = [
        {
          address: "0x1234567890123456789012345678901234567890",
          courtID: 0,
        },
        {
          address: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          courtID: 0xffffffffffff, // max uint96
        },
        {
          address: "0x0000000000000000000000000000000000000001",
          courtID: 1,
        },
        {
          address: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
          courtID: 123456789,
        },
      ];

      for (const testCase of testCases) {
        // Test packing
        const stakePathID = await sortitionTree.testToStakePathID(testCase.address, testCase.courtID);

        // Test unpacking
        const [unpackedAddress, unpackedCourtID] = await sortitionTree.testToAccountAndCourtID(stakePathID);

        // Verify round-trip equivalence
        expect(unpackedAddress.toLowerCase()).to.equal(testCase.address.toLowerCase());
        expect(unpackedCourtID).to.equal(testCase.courtID);

        // Verify the packed format is as expected: [20 bytes address][12 bytes courtID]
        const expectedPackedValue = ethers.solidityPacked(["address", "uint96"], [testCase.address, testCase.courtID]);
        expect(stakePathID).to.equal(expectedPackedValue);
      }
    });

    it("Should handle TreeKey conversion correctly", async function () {
      const courtIDs = [
        0,
        1,
        100,
        0xffffffffffff, // max uint96
      ];

      for (const courtID of courtIDs) {
        const treeKey = await sortitionTree.testToTreeKey(courtID);

        // TreeKey should be the courtID padded to 32 bytes
        const expectedTreeKey = ethers.zeroPadValue(ethers.toBeHex(courtID), 32);
        expect(treeKey).to.equal(expectedTreeKey);

        // Court ID 0 will result in zero key, others should not
        if (courtID === 0) {
          expect(treeKey).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
        } else {
          expect(treeKey).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
        }
      }
    });
  });

  describe("Tree Creation & Validation", function () {
    it("Should create trees with valid K values", async function () {
      const testCases = [
        { courtID: 0, k: 2 },
        { courtID: 1, k: 5 },
        { courtID: 100, k: 10 },
        { courtID: 999, k: 100 },
      ];

      for (const testCase of testCases) {
        await sortitionTree.createTree(testCase.courtID, testCase.k);

        // Verify tree was created
        expect(await sortitionTree.courtExists(testCase.courtID)).to.be.true;
        expect(await sortitionTree.getTreeK(testCase.courtID)).to.equal(testCase.k);

        // Verify initial state
        const nodes = await sortitionTree.getTreeNodes(testCase.courtID);
        expect(nodes.length).to.equal(1);
        expect(nodes[0]).to.equal(0); // Root starts at 0

        const stack = await sortitionTree.getTreeStack(testCase.courtID);
        expect(stack.length).to.equal(0); // Empty stack initially
      }
    });

    it("Should reject invalid K values", async function () {
      // K must be greater than 1
      await expect(sortitionTree.createTree(0, 0)).to.be.reverted;
      await expect(sortitionTree.createTree(1, 1)).to.be.reverted;
    });

    it("Should reject creating duplicate trees", async function () {
      await sortitionTree.createTree(0, 2);
      await expect(sortitionTree.createTree(0, 3)).to.be.reverted;
    });

    it("Should create multiple independent trees", async function () {
      await sortitionTree.createTree(0, 2);
      await sortitionTree.createTree(1, 3);
      await sortitionTree.createTree(2, 5);

      expect(await sortitionTree.getTreeK(0)).to.equal(2);
      expect(await sortitionTree.getTreeK(1)).to.equal(3);
      expect(await sortitionTree.getTreeK(2)).to.equal(5);
    });
  });

  describe("Single Court Stake Management", function () {
    beforeEach(async function () {
      // Create a test tree with K=2 for court 0
      await sortitionTree.createTree(0, 2);
    });

    describe("Adding New Stakes", function () {
      it("Should add first juror to empty tree", async function () {
        const juror = getTestAddress(0);
        const stake = 100;

        await sortitionTree.set(0, juror, stake);

        // Verify stake was set
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(stake);
        expect(await sortitionTree.getRootSum(0)).to.equal(stake);

        // Verify tree structure
        const nodes = await sortitionTree.getTreeNodes(0);
        expect(nodes[0]).to.equal(stake); // Root should equal juror stake
        expect(nodes[1]).to.equal(stake); // First leaf
      });

      it("Should add multiple jurors sequentially", async function () {
        const stakes = [100, 200, 300];

        for (let i = 0; i < stakes.length; i++) {
          const juror = getTestAddress(i);
          await sortitionTree.set(0, juror, stakes[i]);
          expect(await sortitionTree.stakeOf(0, juror)).to.equal(stakes[i]);
        }

        // Verify total stake
        const expectedTotal = stakes.reduce((sum, stake) => sum + stake, 0);
        expect(await sortitionTree.getRootSum(0)).to.equal(expectedTotal);
      });

      it("Should handle tree restructuring when K threshold is reached", async function () {
        // Add enough jurors to trigger tree restructuring
        const stakes = [100, 200, 300, 400]; // More than K=2

        for (let i = 0; i < stakes.length; i++) {
          const juror = getTestAddress(i);
          await sortitionTree.set(0, juror, stakes[i]);
        }

        const nodes = await sortitionTree.getTreeNodes(0);
        expect(nodes.length).to.be.greaterThan(4); // Should have expanded

        const expectedTotal = stakes.reduce((sum, stake) => sum + stake, 0);
        expect(await sortitionTree.getRootSum(0)).to.equal(expectedTotal);
      });
    });

    describe("Updating Existing Stakes", function () {
      beforeEach(async function () {
        // Add initial jurors
        await sortitionTree.set(0, getTestAddress(0), 100);
        await sortitionTree.set(0, getTestAddress(1), 200);
      });

      it("Should increase stake values correctly", async function () {
        const juror = getTestAddress(0);
        const oldStake = await sortitionTree.stakeOf(0, juror);
        const newStake = 250;

        await sortitionTree.set(0, juror, newStake);

        expect(await sortitionTree.stakeOf(0, juror)).to.equal(newStake);

        // Root should reflect the change
        const rootSum = await sortitionTree.getRootSum(0);
        expect(rootSum).to.equal(200 + newStake);
      });

      it("Should decrease stake values correctly", async function () {
        const juror = getTestAddress(0);
        const newStake = 50;

        await sortitionTree.set(0, juror, newStake);

        expect(await sortitionTree.stakeOf(0, juror)).to.equal(newStake);
        expect(await sortitionTree.getRootSum(0)).to.equal(200 + newStake);
      });

      it("Should be no-op when setting same value", async function () {
        const juror = getTestAddress(0);
        const currentStake = await sortitionTree.stakeOf(0, juror);
        const initialRoot = await sortitionTree.getRootSum(0);

        await sortitionTree.set(0, juror, currentStake);

        expect(await sortitionTree.stakeOf(0, juror)).to.equal(currentStake);
        expect(await sortitionTree.getRootSum(0)).to.equal(initialRoot);
      });
    });

    describe("Removing Stakes", function () {
      beforeEach(async function () {
        // Add initial jurors
        await sortitionTree.set(0, getTestAddress(0), 100);
        await sortitionTree.set(0, getTestAddress(1), 200);
        await sortitionTree.set(0, getTestAddress(2), 300);
      });

      it("Should remove juror by setting stake to 0", async function () {
        const juror = getTestAddress(1);
        const initialRoot = await sortitionTree.getRootSum(0);

        await sortitionTree.set(0, juror, 0);

        expect(await sortitionTree.stakeOf(0, juror)).to.equal(0);
        expect(await sortitionTree.getRootSum(0)).to.equal(initialRoot - 200n);
        expect(await sortitionTree.getNodeIndex(0, juror)).to.equal(0); // Should be cleared
      });

      it("Should manage stack for removed positions", async function () {
        const juror = getTestAddress(1);
        const initialStackLength = (await sortitionTree.getTreeStack(0)).length;

        await sortitionTree.set(0, juror, 0);

        const newStackLength = (await sortitionTree.getTreeStack(0)).length;
        expect(newStackLength).to.be.greaterThan(initialStackLength);
      });

      it("Should reuse vacant positions from stack", async function () {
        const juror1 = getTestAddress(1);
        const juror4 = getTestAddress(4);

        // Remove a juror
        await sortitionTree.set(0, juror1, 0);
        const stackAfterRemoval = await sortitionTree.getTreeStack(0);

        // Add a new juror (should reuse vacant position)
        await sortitionTree.set(0, juror4, 150);
        const stackAfterAdd = await sortitionTree.getTreeStack(0);

        expect(stackAfterAdd.length).to.equal(stackAfterRemoval.length - 1);
        expect(await sortitionTree.stakeOf(0, juror4)).to.equal(150);
      });
    });
  });

  describe("Drawing Algorithm", function () {
    beforeEach(async function () {
      await sortitionTree.createTree(0, 2);
    });

    it("Should return zero address for empty tree", async function () {
      const [drawnAddress, courtID] = await sortitionTree.draw(0, 1, 1, 12345);
      expect(drawnAddress).to.equal(ethers.ZeroAddress);
      expect(courtID).to.equal(0);
    });

    it("Should draw single juror from single-juror tree", async function () {
      const juror = getTestAddress(0);
      await sortitionTree.set(0, juror, 100);

      // Multiple draws should always return the same juror
      for (let i = 0; i < 5; i++) {
        const [drawnAddress, courtID] = await sortitionTree.draw(0, 1, i, 12345 + i);
        expect(drawnAddress.toLowerCase()).to.equal(juror.toLowerCase());
        expect(courtID).to.equal(0);
      }
    });

    it("Should draw deterministically with same inputs", async function () {
      // Add multiple jurors
      await sortitionTree.set(0, getTestAddress(0), 100);
      await sortitionTree.set(0, getTestAddress(1), 200);
      await sortitionTree.set(0, getTestAddress(2), 300);

      const disputeID = 1;
      const nonce = 2;
      const randomNumber = 12345;

      // Multiple calls with same parameters should return same result
      const [address1] = await sortitionTree.draw(0, disputeID, nonce, randomNumber);
      const [address2] = await sortitionTree.draw(0, disputeID, nonce, randomNumber);
      const [address3] = await sortitionTree.draw(0, disputeID, nonce, randomNumber);

      expect(address1).to.equal(address2);
      expect(address2).to.equal(address3);
    });

    it("Should respect weighted probability distribution", async function () {
      // Add jurors with very different stakes to test weighting
      await sortitionTree.set(0, getTestAddress(0), 1); // Very low stake
      await sortitionTree.set(0, getTestAddress(1), 1000); // Very high stake

      let draws = { [getTestAddress(0).toLowerCase()]: 0, [getTestAddress(1).toLowerCase()]: 0 };

      // Perform many draws with different random numbers
      const numDraws = 100;
      for (let i = 0; i < numDraws; i++) {
        const [drawnAddress] = await sortitionTree.draw(0, 1, 1, i);
        draws[drawnAddress.toLowerCase()]++;
      }

      // Juror with higher stake should be drawn more frequently
      // With stakes of 1:1000, we expect roughly 0.1% vs 99.9% distribution
      expect(draws[getTestAddress(1).toLowerCase()]).to.be.greaterThan(draws[getTestAddress(0).toLowerCase()]);
      expect(draws[getTestAddress(1).toLowerCase()]).to.be.greaterThan(numDraws * 0.8); // At least 80% for high stake
    });

    it("Should handle edge case random numbers", async function () {
      await sortitionTree.set(0, getTestAddress(0), 100);
      await sortitionTree.set(0, getTestAddress(1), 200);

      // Test with boundary random numbers
      const testNumbers = [0, 1, ethers.MaxUint256];

      for (const randomNumber of testNumbers) {
        const [drawnAddress] = await sortitionTree.draw(0, 1, 1, randomNumber);
        expect(drawnAddress).to.not.equal(ethers.ZeroAddress);

        // Should be one of our jurors
        const isValidJuror =
          drawnAddress.toLowerCase() === getTestAddress(0).toLowerCase() ||
          drawnAddress.toLowerCase() === getTestAddress(1).toLowerCase();
        expect(isValidJuror).to.be.true;
      }
    });
  });

  describe("Multi-Court Scenarios", function () {
    beforeEach(async function () {
      // Create multiple courts with different K values
      await sortitionTree.createTree(0, 2); // General Court
      await sortitionTree.createTree(1, 3); // Tech Court
      await sortitionTree.createTree(2, 2); // Legal Court
    });

    describe("Independent Court Operations", function () {
      it("Should handle same juror staking in multiple courts", async function () {
        const juror = getTestAddress(0);
        const stakes = [100, 250, 75]; // Different stakes in different courts

        // Set stakes in different courts
        for (let courtID = 0; courtID < 3; courtID++) {
          await sortitionTree.set(courtID, juror, stakes[courtID]);
        }

        // Verify stakes are independent
        for (let courtID = 0; courtID < 3; courtID++) {
          expect(await sortitionTree.stakeOf(courtID, juror)).to.equal(stakes[courtID]);
          expect(await sortitionTree.getRootSum(courtID)).to.equal(stakes[courtID]);
        }
      });

      it("Should maintain court isolation", async function () {
        const juror1 = getTestAddress(0);
        const juror2 = getTestAddress(1);

        // Add different jurors to different courts
        await sortitionTree.set(0, juror1, 100);
        await sortitionTree.set(1, juror2, 200);

        // Court 0 should only have juror1
        expect(await sortitionTree.stakeOf(0, juror1)).to.equal(100);
        expect(await sortitionTree.stakeOf(0, juror2)).to.equal(0);

        // Court 1 should only have juror2
        expect(await sortitionTree.stakeOf(1, juror1)).to.equal(0);
        expect(await sortitionTree.stakeOf(1, juror2)).to.equal(200);
      });

      it("Should handle different tree structures independently", async function () {
        const jurors = [getTestAddress(0), getTestAddress(1), getTestAddress(2), getTestAddress(3)];

        // Add different numbers of jurors to each court
        await sortitionTree.set(0, jurors[0], 100); // 1 juror in court 0

        await sortitionTree.set(1, jurors[0], 150); // 2 jurors in court 1
        await sortitionTree.set(1, jurors[1], 250);

        await sortitionTree.set(2, jurors[0], 75); // 3 jurors in court 2
        await sortitionTree.set(2, jurors[1], 125);
        await sortitionTree.set(2, jurors[2], 175);

        // Verify independent tree structures
        expect(await sortitionTree.getRootSum(0)).to.equal(100);
        expect(await sortitionTree.getRootSum(1)).to.equal(400);
        expect(await sortitionTree.getRootSum(2)).to.equal(375);

        // Verify each court has correct tree structure
        const nodes0 = await sortitionTree.getTreeNodes(0);
        const nodes1 = await sortitionTree.getTreeNodes(1);
        const nodes2 = await sortitionTree.getTreeNodes(2);

        expect(nodes0.length).to.be.lessThan(nodes2.length); // Fewer jurors = smaller tree
        expect(nodes1.length).to.be.greaterThan(nodes0.length); // More jurors = larger tree
      });
    });

    describe("Cross-Court Stake Updates", function () {
      it("Should handle simultaneous updates across multiple courts", async function () {
        const juror = getTestAddress(0);
        const courtIDs = [0, 1, 2];
        const initialStakes = [100, 200, 300];
        const updatedStakes = [150, 250, 350];

        // Set initial stakes
        for (let i = 0; i < courtIDs.length; i++) {
          await sortitionTree.set(courtIDs[i], juror, initialStakes[i]);
        }

        // Update all stakes
        for (let i = 0; i < courtIDs.length; i++) {
          await sortitionTree.set(courtIDs[i], juror, updatedStakes[i]);
        }

        // Verify all updates took effect
        for (let i = 0; i < courtIDs.length; i++) {
          expect(await sortitionTree.stakeOf(courtIDs[i], juror)).to.equal(updatedStakes[i]);
        }
      });

      it("Should handle partial removals across courts", async function () {
        const juror = getTestAddress(0);

        // Add juror to all courts
        await sortitionTree.set(0, juror, 100);
        await sortitionTree.set(1, juror, 200);
        await sortitionTree.set(2, juror, 300);

        // Remove from middle court only
        await sortitionTree.set(1, juror, 0);

        // Verify partial removal
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(100);
        expect(await sortitionTree.stakeOf(1, juror)).to.equal(0);
        expect(await sortitionTree.stakeOf(2, juror)).to.equal(300);
      });

      it("Should use batch operations correctly", async function () {
        const juror = getTestAddress(0);
        const courtIDs = [0, 1, 2];
        const stake = 500;

        // Use batch operation to set stakes
        await sortitionTree.setStakeInHierarchy(courtIDs, juror, stake);

        // Verify all stakes were set
        const stakes = await sortitionTree.getStakesAcrossCourts(juror, courtIDs);
        for (const retrievedStake of stakes) {
          expect(retrievedStake).to.equal(stake);
        }
      });
    });

    describe("Multi-Court Drawing", function () {
      beforeEach(async function () {
        // Setup jurors in different courts
        await sortitionTree.set(0, getTestAddress(0), 100); // Court 0: 1 juror
        await sortitionTree.set(0, getTestAddress(1), 200);

        await sortitionTree.set(1, getTestAddress(1), 300); // Court 1: 2 jurors
        await sortitionTree.set(1, getTestAddress(2), 400);

        await sortitionTree.set(2, getTestAddress(0), 500); // Court 2: 1 juror only
      });

      it("Should draw correctly from different courts", async function () {
        // Draw from each court
        const [addr0] = await sortitionTree.draw(0, 1, 1, 12345);
        const [addr1] = await sortitionTree.draw(1, 1, 1, 12345);
        const [addr2] = await sortitionTree.draw(2, 1, 1, 12345);

        // Should get valid addresses from each court
        expect(addr0).to.not.equal(ethers.ZeroAddress);
        expect(addr1).to.not.equal(ethers.ZeroAddress);
        expect(addr2).to.not.equal(ethers.ZeroAddress);

        // Court 2 should always return getTestAddress(0) since it's the only juror
        expect(addr2.toLowerCase()).to.equal(getTestAddress(0).toLowerCase());
      });

      it("Should return correct court ID in draw results", async function () {
        const [, courtID0] = await sortitionTree.draw(0, 1, 1, 12345);
        const [, courtID1] = await sortitionTree.draw(1, 1, 1, 12345);
        const [, courtID2] = await sortitionTree.draw(2, 1, 1, 12345);

        // The returned court IDs should match the stake path IDs
        // Since we're using the same court for staking and drawing, they should match
        expect([0, 1]).to.include(Number(courtID0));
        expect([1, 2]).to.include(Number(courtID1));
        expect(Number(courtID2)).to.equal(2);
      });

      it("Should maintain independent probability distributions", async function () {
        // Test drawing many times from court 0 where juror 1 has 2x stake of juror 0
        let draws = { [getTestAddress(0).toLowerCase()]: 0, [getTestAddress(1).toLowerCase()]: 0 };

        const numDraws = 50;
        for (let i = 0; i < numDraws; i++) {
          const [drawnAddress] = await sortitionTree.draw(0, 1, 1, i);
          draws[drawnAddress.toLowerCase()]++;
        }

        // Juror 1 (200 stake) should be drawn more than juror 0 (100 stake)
        expect(draws[getTestAddress(1).toLowerCase()]).to.be.greaterThan(draws[getTestAddress(0).toLowerCase()]);
      });
    });

    describe("Complex Multi-Court Scenarios", function () {
      it("Should handle realistic court hierarchy simulation", async function () {
        // Simulate: General Court (0) ← Tech Court (1) ← Blockchain Court (2)
        const courts = [0, 1, 2];
        const jurors = [getTestAddress(0), getTestAddress(1), getTestAddress(2), getTestAddress(3)];

        // General lawyers (stake in General Court only)
        await sortitionTree.set(0, jurors[0], 100);
        await sortitionTree.set(0, jurors[1], 150);

        // Tech specialists (stake in both General and Tech)
        await sortitionTree.set(0, jurors[2], 200);
        await sortitionTree.set(1, jurors[2], 300);

        // Blockchain experts (stake in all three)
        await sortitionTree.set(0, jurors[3], 250);
        await sortitionTree.set(1, jurors[3], 350);
        await sortitionTree.set(2, jurors[3], 450);

        // Verify hierarchy totals
        expect(await sortitionTree.getRootSum(0)).to.equal(700); // All jurors
        expect(await sortitionTree.getRootSum(1)).to.equal(650); // Tech specialists + experts
        expect(await sortitionTree.getRootSum(2)).to.equal(450); // Blockchain experts only

        // Test drawing from most specialized court (should only get experts)
        const [blockchainExpert] = await sortitionTree.draw(2, 1, 1, 12345);
        expect(blockchainExpert.toLowerCase()).to.equal(jurors[3].toLowerCase());
      });

      it("Should handle dynamic court operations", async function () {
        const juror = getTestAddress(0);

        // Juror starts in general court
        await sortitionTree.set(0, juror, 100);
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(100);

        // Juror specializes in tech court
        await sortitionTree.set(1, juror, 200);
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(100);
        expect(await sortitionTree.stakeOf(1, juror)).to.equal(200);

        // Juror reduces general court involvement but increases tech specialization
        await sortitionTree.set(0, juror, 50);
        await sortitionTree.set(1, juror, 400);
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(50);
        expect(await sortitionTree.stakeOf(1, juror)).to.equal(400);

        // Juror completely leaves general court
        await sortitionTree.set(0, juror, 0);
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(0);
        expect(await sortitionTree.stakeOf(1, juror)).to.equal(400);
      });

      it("Should handle large multi-court operations efficiently", async function () {
        const numCourts = 5;
        const numJurors = 10;

        // Create additional courts
        for (let courtID = 3; courtID < numCourts; courtID++) {
          await sortitionTree.createTree(courtID, 2);
        }

        // Add many jurors across many courts
        for (let jurorIdx = 0; jurorIdx < numJurors; jurorIdx++) {
          for (let courtID = 0; courtID < numCourts; courtID++) {
            const stake = (jurorIdx + 1) * (courtID + 1) * 10; // Varied stakes
            await sortitionTree.set(courtID, getTestAddress(jurorIdx), stake);
          }
        }

        // Verify all operations completed successfully
        for (let courtID = 0; courtID < numCourts; courtID++) {
          const rootSum = await sortitionTree.getRootSum(courtID);
          expect(rootSum).to.be.greaterThan(0);

          // Should be able to draw from each court
          const [drawnAddress] = await sortitionTree.draw(courtID, 1, 1, 12345 + courtID);
          expect(drawnAddress).to.not.equal(ethers.ZeroAddress);
        }
      });
    });
  });

  describe("Edge Cases & Error Conditions", function () {
    it("Should handle operations on non-existent courts", async function () {
      const juror = getTestAddress(0);

      // Operations on non-existent court should behave predictably
      expect(await sortitionTree.courtExists(999)).to.be.false;
      expect(await sortitionTree.stakeOf(999, juror)).to.equal(0);

      // Drawing from non-existent court should revert (no tree = no nodes array)
      await expect(sortitionTree.draw(999, 1, 1, 12345)).to.be.reverted;
    });

    it("Should handle boundary values correctly", async function () {
      await sortitionTree.createTree(0, 2);
      const juror = getTestAddress(0);

      // Test with maximum stake value
      const maxStake = ethers.MaxUint256;

      // This might fail due to gas limits, but should not revert due to overflow
      // Note: In practice, stakes would be much smaller
      try {
        await sortitionTree.set(0, juror, maxStake);
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(maxStake);
      } catch (error) {
        // Expected to fail due to gas limits, not due to overflow
        expect(error).to.match(/gas/i);
      }
    });

    it("Should maintain tree invariants under stress", async function () {
      await sortitionTree.createTree(0, 3);

      const operations = [];
      const stakes = [100, 200, 300, 400, 500];
      const jurors = stakes.map((_, i) => getTestAddress(i));

      // Perform many random operations
      for (let i = 0; i < 20; i++) {
        const juror = jurors[i % jurors.length];
        const stake = stakes[i % stakes.length];

        await sortitionTree.set(0, juror, stake);
        operations.push({ juror, stake });
      }

      // Verify tree integrity
      let expectedTotal = 0;
      const finalStakes = new Map();

      // Calculate expected final state
      for (const op of operations) {
        const prevStake = finalStakes.get(op.juror) || 0;
        expectedTotal = expectedTotal - prevStake + op.stake;
        finalStakes.set(op.juror, op.stake);
      }

      // Verify actual state matches expected
      expect(await sortitionTree.getRootSum(0)).to.equal(expectedTotal);

      for (const [juror, expectedStake] of finalStakes) {
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(expectedStake);
      }
    });

    it("Should handle rapid stake changes correctly", async function () {
      await sortitionTree.createTree(0, 2);
      const juror = getTestAddress(0);

      // Rapid stake changes
      const stakeSequence = [100, 0, 200, 300, 0, 150, 0, 500];

      for (const stake of stakeSequence) {
        await sortitionTree.set(0, juror, stake);
        expect(await sortitionTree.stakeOf(0, juror)).to.equal(stake);
        expect(await sortitionTree.getRootSum(0)).to.equal(stake);
      }
    });
  });
});
