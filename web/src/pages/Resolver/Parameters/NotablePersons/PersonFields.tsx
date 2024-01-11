import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import { landscapeStyle } from "styles/landscapeStyle";
import { Alias, useNewDisputeContext } from "context/NewDisputeContext";
import LabeledInput from "components/LabeledInput";
import { validateAddress } from "utils/validateAddressOrEns";
import { isUndefined } from "utils/index";

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

  const debounceValidateAddress = (address: string, key: number) => {
    // Clear the existing timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Set a new timer for validation after 500 milliseconds
    validationTimerRef.current = setTimeout(async () => {
      const isValid = await validateAddress(address);
      const updatedAliases = disputeData.aliases;
      if (isUndefined(updatedAliases) || isUndefined(updatedAliases[key])) return;
      updatedAliases[key].isValid = isValid;

      setDisputeData({ ...disputeData, aliases: updatedAliases });
    }, 300);
  };
  const handleAliasesWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = parseInt(event.target.id.replace(/\D/g, ""), 10) - 1;
    let aliases = disputeData.aliases;
    if (isUndefined(aliases)) return;

    aliases[key] = { ...aliases[key], [event.target.name]: event.target.value };
    setDisputeData({ ...disputeData, aliases });

    //since resolving ens is async, we update asynchronously too with debounce
    event.target.name === "address" && debounceValidateAddress(event.target.value, key);
  };

  const showError = (alias: Alias) => {
    return alias.address !== "" && !alias.isValid;
  };

  return (
    <Container>
      {disputeData.aliases?.map((alias, index) => (
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
