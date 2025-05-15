import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import { usePublicClient } from "wagmi";

import { AliasArray, useNewDisputeContext } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";
import { validateAddress } from "utils/validateAddressOrEns";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import LabeledInput from "components/LabeledInput";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  width: 84vw;

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const AliasContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns: 190px auto;
    `
  )}
`;

const PersonFields: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const publicClient = usePublicClient({ chainId: 1 });

  const debounceValidateAddress = (address: string, key: number) => {
    if (isUndefined(publicClient)) return;
    // Clear the existing timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Set a new timer for validation after 500 milliseconds
    validationTimerRef.current = setTimeout(async () => {
      const isValid = await validateAddress(address, publicClient);
      const updatedAliases = disputeData.aliasesArray;
      if (isUndefined(updatedAliases) || isUndefined(updatedAliases[key])) return;
      updatedAliases[key].isValid = isValid;

      setDisputeData({ ...disputeData, aliasesArray: updatedAliases });
    }, 500);
  };

  // in case of duplicate creation flow, aliasesArray will already be populated.
  // validating addresses in case it is
  useEffect(() => {
    if (disputeData.aliasesArray && publicClient) {
      disputeData.aliasesArray.map(async (alias, key) => {
        const isValid = await validateAddress(alias.address, publicClient);
        const updatedAliases = disputeData.aliasesArray;
        if (isUndefined(updatedAliases) || isUndefined(updatedAliases[key])) return;
        updatedAliases[key].isValid = isValid;

        setDisputeData({ ...disputeData, aliasesArray: updatedAliases });
      });
    }
  }, []);

  const handleAliasesWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = parseInt(event.target.id.replace(/\D/g, ""), 10) - 1;
    const aliases = disputeData.aliasesArray;
    if (isUndefined(aliases)) return;

    aliases[key] = { ...aliases[key], [event.target.name]: event.target.value };
    setDisputeData({ ...disputeData, aliasesArray: aliases });

    //since resolving ens is async, we update asynchronously too with debounce
    if (event.target.name === "address") debounceValidateAddress(event.target.value, key);
  };

  const showError = (alias: AliasArray) => {
    return alias.address !== "" && !alias.isValid;
  };

  return (
    <Container>
      {disputeData.aliasesArray?.map((alias, index) => (
        <AliasContainer key={alias?.id}>
          <LabeledInput
            name="name"
            label={`Person ${index + 1}`}
            placeholder="eg. Alice (Developer)"
            value={alias.name}
            onChange={handleAliasesWrite}
          />
          <LabeledInput
            name="address"
            label={`Person ${index + 1} Address`}
            variant={showError(alias) ? "error" : ""}
            message={showError(alias) ? "Invalid Address or ENS" : ""}
            placeholder="eg. Alice.eth"
            value={alias.address}
            onChange={handleAliasesWrite}
          />
        </AliasContainer>
      ))}
    </Container>
  );
};
export default PersonFields;
