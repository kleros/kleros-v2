import { useState, useEffect } from "react";

import { ethers } from "ethers";
import moment from "moment";

import { getChainRpcUrl } from "context/Web3Provider";

export const useBlockByTimestamp = (chainId, timestamp) => {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider(getChainRpcUrl("https", chainId));

    const getBlockByTimestamp = async () => {
      const getBlockWrapper = async (block) => {
        const blockData = await provider.getBlock(block);
        return {
          timestamp: blockData.timestamp,
          number: blockData.number,
        };
      };

      const getBoundaries = async () => {
        const latestBlock = await getBlockWrapper("latest");
        const firstBlock = await getBlockWrapper(1);
        const blockTime = (latestBlock.timestamp - firstBlock.timestamp) / (latestBlock.number - 1);
        return { latestBlock, firstBlock, blockTime };
      };

      const findBetter = async (date, predictedBlock, after, blockTime) => {
        if (await isBetterBlock(date, predictedBlock, after)) return predictedBlock.number;
        const difference = date.diff(moment.unix(predictedBlock.timestamp), "seconds");
        let skip = Math.ceil(difference / (blockTime === 0 ? 1 : blockTime));
        if (skip === 0) skip = difference < 0 ? -1 : 1;
        const nextPredictedBlock = await getBlockWrapper(predictedBlock.number + skip);
        blockTime = Math.abs(
          (predictedBlock.timestamp - nextPredictedBlock.timestamp) /
            (predictedBlock.number - nextPredictedBlock.number)
        );
        return findBetter(date, nextPredictedBlock, after, blockTime);
      };

      const isBetterBlock = async (date, predictedBlock, after) => {
        const blockTime = moment.unix(predictedBlock.timestamp);
        if (after) {
          if (blockTime.isBefore(date)) return false;
          const previousBlock = await getBlockWrapper(predictedBlock.number - 1);
          if (blockTime.isSameOrAfter(date) && moment.unix(previousBlock.timestamp).isBefore(date)) return true;
        } else {
          if (blockTime.isSameOrAfter(date)) return false;
          const nextBlock = await getBlockWrapper(predictedBlock.number + 1);
          if (blockTime.isBefore(date) && moment.unix(nextBlock.timestamp).isSameOrAfter(date)) return true;
        }
        return false;
      };

      try {
        const date = moment.utc(timestamp);
        const { latestBlock, firstBlock, blockTime } = await getBoundaries();

        if (date.isBefore(moment.unix(firstBlock.timestamp))) {
          setBlockNumber(firstBlock.number);
          setLoading(false);
          return;
        }
        if (date.isSameOrAfter(moment.unix(latestBlock.timestamp))) {
          setBlockNumber(latestBlock.number);
          setLoading(false);
          return;
        }

        const predictedBlockNumber = Math.ceil(date.diff(moment.unix(firstBlock.timestamp), "seconds") / blockTime);
        const predictedBlock = await getBlockWrapper(predictedBlockNumber);

        const block = await findBetter(date, predictedBlock, true, blockTime);
        setBlockNumber(block);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getBlockByTimestamp();
  }, [chainId, timestamp]);

  return { blockNumber, loading };
};
