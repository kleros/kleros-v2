import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { useRulerContext } from "context/RulerContext";
import { useSimulateKlerosCoreRulerChangeRuler, useWriteKlerosCoreRulerChangeRuler } from "hooks/contracts/generated";
import { isUndefined } from "utils/isUndefined";
import { wrapWithToast } from "utils/wrapWithToast";

import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledLabel = styled.label`
  word-wrap: break-word;
`;

const ChangeDeveloper: React.FC = () => {
  const { arbitrable, currentDeveloper, refetchData, isRulerOfArbitrable } = useRulerContext();
  const [newDeveloper, setNewDeveloper] = useState<Address>("" as `0x${string}`);
  const [isChanging, setIsChanging] = useState(false);
  const publicClient = usePublicClient();

  const isValid = useMemo(
    () => !isUndefined(newDeveloper) && (newDeveloper === ("" as `0x${string}`) || isAddress(newDeveloper)),
    [newDeveloper]
  );

  const {
    data: changeRulerConfig,
    isLoading,
    isError,
  } = useSimulateKlerosCoreRulerChangeRuler({
    query: {
      enabled: !isUndefined(arbitrable) && !isUndefined(newDeveloper) && isRulerOfArbitrable,
    },
    args: [(arbitrable ?? "") as Address, (newDeveloper ?? "") as Address],
  });

  const { writeContractAsync: changeRuler } = useWriteKlerosCoreRulerChangeRuler();

  const handleClick = useCallback(() => {
    if (!publicClient || !changeRulerConfig) return;
    setIsChanging(true);
    wrapWithToast(async () => changeRuler(changeRulerConfig.request), publicClient)
      .then(() => refetchData())
      .finally(() => setIsChanging(false));
  }, [publicClient, changeRulerConfig, changeRuler, refetchData]);

  return (
    <Container>
      <Header text="Developer" />
      <InputContainer>
        <StyledLabel>Current Developer : {currentDeveloper ?? "None"}</StyledLabel>
        <LabeledInput
          label="New Developer"
          onChange={(e) => setNewDeveloper(e.target.value as Address)}
          message={isValid ? "" : "Invalid Address"}
          variant={isValid ? "" : "error"}
        />
      </InputContainer>
      <Button
        text="Update"
        onClick={handleClick}
        isLoading={isLoading || isChanging}
        disabled={isError || isLoading || isChanging || isUndefined(arbitrable) || !isRulerOfArbitrable}
      />
    </Container>
  );
};

export default ChangeDeveloper;
