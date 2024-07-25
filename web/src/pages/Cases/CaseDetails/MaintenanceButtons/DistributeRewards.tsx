import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreAbi, klerosCoreAddress } from "hooks/contracts/generated";
import useTransactionBatcher, { type TransactionBatcherConfig } from "hooks/useTransactionBatcher";
import { wrapWithToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { IBaseMaintenanceButton } from ".";

const StyledButton = styled(Button)`
  width: 100%;
`;

interface IDistributeRewards extends IBaseMaintenanceButton {
  numberOfVotes?: string;
  roundIndex?: string;
}

const DistributeRewards: React.FC<IDistributeRewards> = ({ id, numberOfVotes, roundIndex, setIsOpen }) => {
  const [isSending, setIsSending] = useState(false);
  const [contractConfigs, setContractConfigs] = useState<TransactionBatcherConfig>();
  const publicClient = usePublicClient();
  const { chainId } = useAccount();

  useEffect(() => {
    if (!id || !roundIndex || !numberOfVotes) return;

    const baseArgs = {
      abi: klerosCoreAbi,
      address: klerosCoreAddress[chainId ?? DEFAULT_CHAIN],
      functionName: "execute",
    };

    const argsArr: TransactionBatcherConfig = [];
    let nbVotes = parseInt(numberOfVotes);

    // each previous round has (n - 1)/2 jurors
    for (let i = parseInt(roundIndex); i >= 0; i--) {
      argsArr.push({ ...baseArgs, args: [BigInt(id), BigInt(i), BigInt(nbVotes)] });

      nbVotes = (nbVotes - 1) / 2;
    }

    setContractConfigs(argsArr);
  }, [id, roundIndex, numberOfVotes, chainId]);

  const { executeBatch, isLoading: isLoadingConfig, isError } = useTransactionBatcher(contractConfigs);

  const isLoading = useMemo(() => isLoadingConfig || isSending, [isLoadingConfig, isSending]);
  const isDisabled = useMemo(
    () => isUndefined(id) || isUndefined(numberOfVotes) || isError || isLoading,
    [id, numberOfVotes, isError, isLoading]
  );

  const handleClick = () => {
    setIsSending(true);

    wrapWithToast(async () => await executeBatch(), publicClient).finally(() => {
      setIsOpen(false);
    });
  };
  return <StyledButton text="Rewards" small isLoading={isLoading} disabled={isDisabled} onClick={handleClick} />;
};

export default DistributeRewards;
