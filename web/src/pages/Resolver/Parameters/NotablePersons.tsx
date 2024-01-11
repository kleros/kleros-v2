import React, { useRef } from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import NavigationButtons from "../NavigationButtons";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import LabeledInput from "components/LabeledInput";
import PlusMinusField from "components/PlusMinusField";
import { Alias, useNewDisputeContext } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";
import { validateAddress } from "~src/utils/validateAddressOrEns";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const MiddleContainer = styled.div`
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

const StyledPlusMinusField = styled(PlusMinusField)`
  align-self: start;
`;

const NotablePersons: React.FC = () => {
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
      if (isUndefined(updatedAliases)) return;
      updatedAliases[key].isValid = isValid;

      setDisputeData({ ...disputeData, aliases: updatedAliases });
    }, 300);
  };

  //value here is the total number of fields-
  const updateNumberOfAliases = (value: number) => {
    let defaultAlias = { name: "", address: "", id: value.toString() };
    let aliases = disputeData.aliases;

    if (isUndefined(aliases)) {
      return setDisputeData({ ...disputeData, aliases: [defaultAlias] });
    }
    if (value < aliases?.length) return setDisputeData({ ...disputeData, aliases: aliases.splice(0, value) });
    if (value > aliases?.length) return setDisputeData({ ...disputeData, aliases: [...aliases, defaultAlias] });
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
      <Header text="Notable Persons" />
      <MiddleContainer>
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
      </MiddleContainer>

      <StyledPlusMinusField
        currentValue={disputeData.aliases?.length ?? 2}
        updateValue={updateNumberOfAliases}
        minValue={2}
      />
      <NavigationButtons prevRoute="/resolver/votingoptions" nextRoute="/resolver/policy" />
    </Container>
  );
};
export default NotablePersons;
