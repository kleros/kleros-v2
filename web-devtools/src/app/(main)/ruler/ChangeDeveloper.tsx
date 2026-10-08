import React, { useCallback, useMemo, useState } from "react";

import { type Address, isAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { useRulerContext } from "context/RulerContext";
import { useSimulateKlerosCoreRulerChangeRuler, useWriteKlerosCoreRulerChangeRuler } from "hooks/contracts/generated";
import { isUndefined } from "utils/isUndefined";
import { wrapWithToast } from "utils/wrapWithToast";

import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const ChangeDeveloper: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const { arbitrable, currentDeveloper, refetchData } = useRulerContext();
  const [newDeveloper, setNewDeveloper] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const publicClient = usePublicClient();

  const isValid = useMemo(() => newDeveloper === "" || isAddress(newDeveloper), [newDeveloper]);

  const {
    data: changeRulerConfig,
    isLoading,
    isError,
  } = useSimulateKlerosCoreRulerChangeRuler({
    query: {
      enabled:
        !isUndefined(arbitrable) && !isUndefined(newDeveloper) && isAddress(arbitrable) && isAddress(newDeveloper),
    },
    args: [arbitrable as Address, newDeveloper as Address],
  });

  const { writeContractAsync: changeRuler } = useWriteKlerosCoreRulerChangeRuler();

  const handleClick = useCallback(() => {
    if (!publicClient || !changeRulerConfig) return;
    setIsChanging(true);
    wrapWithToast(async () => changeRuler(changeRulerConfig.request), publicClient)
      .then(() => refetchData())
      .finally(() => setIsChanging(false));
  }, [publicClient, changeRulerConfig, changeRuler, refetchData]);

  const isDisabled = useMemo(
    () =>
      !isConnected ||
      chainId !== DEFAULT_CHAIN ||
      !changeRulerConfig ||
      isError ||
      isLoading ||
      isChanging ||
      isUndefined(arbitrable) ||
      !isValid,
    [changeRulerConfig, isError, isLoading, isChanging, arbitrable, isValid, isConnected, chainId]
  );
  return (
    <div className="flex w-full flex-col gap-8">
      <Header text="Developer" tooltipMsg="Address of the current ruler of the selected arbitrable" />
      <div className="flex flex-col gap-4">
        <label className="break-words">Current Developer : {currentDeveloper ?? "None"}</label>
        <LabeledInput
          label="New Developer"
          onChange={setNewDeveloper}
          message={isValid ? "" : "Invalid Address"}
          variant={isValid ? undefined : "error"}
        />
      </div>
      <Button text="Update" onClick={handleClick} isLoading={isLoading || isChanging} isDisabled={isDisabled} />
    </div>
  );
};

export default ChangeDeveloper;
