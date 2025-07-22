import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { useWalletClient, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useSimulateDisputeKitShutterCastVoteShutter } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

const Container = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

interface IReveal {
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
}

const Reveal: React.FC<IReveal> = ({ voteIDs, setIsOpen }) => {
  const { id } = useParams();
  const parsedDisputeID = useMemo(() => BigInt(id ?? 0), [id]);
  const parsedVoteIDs = useMemo(() => voteIDs.map((voteID) => BigInt(voteID)), [voteIDs]);
  const saltKey = useMemo(() => `shutter-dispute-${id}-voteids-${voteIDs}`, [id, voteIDs]);

  const [storedData, _, removeStoredData] = useLocalStorage(saltKey);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isRevealing, setIsRevealing] = useState(false);

  const parsedStoredData = useMemo(() => {
    if (isUndefined(storedData)) return undefined;
    try {
      const data = JSON.parse(storedData);
      if (isUndefined(data.salt) || isUndefined(data.choice) || isUndefined(data.justification)) {
        throw new Error("Invalid stored data");
      }
      return data;
    } catch (error) {
      console.error("Error parsing stored data:", error);
      return undefined;
    }
  }, [storedData]);

  const {
    data: simulateData,
    isLoading: isSimulating,
    error: simulateError,
  } = useSimulateDisputeKitShutterCastVoteShutter({
    query: {
      enabled: !isUndefined(parsedStoredData),
    },
    args: [
      parsedDisputeID,
      parsedVoteIDs,
      BigInt(parsedStoredData?.choice ?? 0),
      BigInt(parsedStoredData?.salt ?? 0),
      parsedStoredData?.justification ?? "",
    ],
  });

  const handleReveal = useCallback(async () => {
    if (isUndefined(parsedStoredData) || isUndefined(simulateData)) {
      console.error("No committed vote found or simulation not ready.");
      return;
    }

    setIsRevealing(true);
    try {
      const { request } = simulateData;
      if (walletClient && publicClient) {
        await wrapWithToast(async () => await walletClient.writeContract(request), publicClient).then(({ status }) => {
          if (status) {
            removeStoredData();
          }
          setIsOpen(status);
        });
      }
    } catch (error) {
      console.error("Error revealing vote:", error);
    } finally {
      setIsRevealing(false);
    }
  }, [parsedStoredData, simulateData, walletClient, publicClient, setIsOpen, removeStoredData]);

  return (
    <Container>
      {!isUndefined(parsedStoredData) ? (
        <Button
          text="Reveal Your Vote"
          onClick={handleReveal}
          disabled={isSimulating || !isUndefined(simulateError) || isRevealing}
          isLoading={isRevealing}
        />
      ) : null}
    </Container>
  );
};

export default Reveal;
