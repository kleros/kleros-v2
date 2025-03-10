import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { formatEther, parseAbi } from "viem";
import { DEFAULT_CHAIN } from "consts/chains";

const ipfsEndpoint = "https://cdn.kleros.link";

const chainIdToParams = {
  421614: {
    contractAddress: "0x9DdAeD4e2Ba34d59025c1A549311F621a8ff9b7b",
    snapshots: ["QmQBupnUD9zt2dzZcB6tNAENiWtmwfWeKDuZbWEWoKs7s2/arbSepolia-snapshot-2025-02.json"],
    startMonth: 2,
  },
  42161: {
    contractAddress: "",
    snapshots: [],
    startMonth: 2,
  },
};

const claimMonthsAbi = parseAbi([
  "function claimMonths(address _liquidityProvider, (uint256 month, uint256 balance, bytes32[] merkleProof)[] claims)",
]);

const ClaimModal = () => {
  const { address: account } = useAccount();
  const chainId = DEFAULT_CHAIN;
  const chainParams = chainIdToParams[chainId] ?? chainIdToParams[DEFAULT_CHAIN];

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!account || !chainParams) return;

      const userClaims = [];
      for (let index = 0; index < chainParams.snapshots.length; index++) {
        const response = await fetch(`${ipfsEndpoint}/ipfs/${chainParams.snapshots[index]}`);
        const snapshot = await response.json();
        const claim = snapshot.merkleTree.claims[account];

        if (claim) {
          userClaims.push({
            month: chainParams.startMonth + index,
            balance: BigInt(claim.value.hex),
            merkleProof: claim.proof,
          });
        }
      }
      setClaims(userClaims);
    };

    fetchClaims();
  }, [account, chainParams]);

  const { writeContractAsync } = useWriteContract();

  const handleClaim = async () => {
    if (!claims.length || !account) return;
    setLoading(true);

    try {
      await writeContractAsync({
        abi: claimMonthsAbi,
        address: chainParams.contractAddress,
        functionName: "claimMonths",
        args: [account, claims],
        gasLimit: 500000,
      });

      setClaimed(true);
    } catch (error) {
      console.error("Transaction failed:", error);
      setClaimed(false);
    }

    setLoading(false);
  };

  const totalClaimableTokens = claims.reduce((acc, claim) => acc + claim.balance, BigInt(0));

  return (
    <div>
      {loading && <div>Loading...</div>}

      {!loading && !claimed && (
        <>
          <p>Claimable Tokens: {formatEther(totalClaimableTokens)} PNK</p>
          <button onClick={handleClaim} disabled={!claims.length}>
            Claim Tokens
          </button>
        </>
      )}

      {claimed && <p>🎉 Tokens Claimed 🎉</p>}
    </div>
  );
};

export default ClaimModal;
