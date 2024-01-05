import React from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import NavigationButtons from "../NavigationButtons";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import LabeledInput from "components/LabeledInput";
import PlusMinusField from "components/PlusMinusField";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";

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

const CounterParties: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  //value here is the total number of fields-
  const updateAliases = (value: number) => {
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
  };

  return (
    <Container>
      <Header text="Counterparties" />
      <MiddleContainer>
        {disputeData.aliases?.map((alias, index) => (
          <AliasContainer key={alias?.id}>
            <LabeledInput
              name="name"
              label={`Party ${index + 1}`}
              placeholder="eg. Alice (Developer)"
              value={alias.name}
              onChange={handleAliasesWrite}
            />
            <LabeledInput
              name="address"
              label={`Party ${index + 1} Address`}
              placeholder="eg. Alice.eth"
              value={alias.address}
              onChange={handleAliasesWrite}
            />
          </AliasContainer>
        ))}
      </MiddleContainer>

      <StyledPlusMinusField currentValue={disputeData.aliases?.length ?? 2} updateValue={updateAliases} minValue={2} />
      <NavigationButtons prevRoute="/resolver/votingoptions" nextRoute="/resolver/policy" />
    </Container>
  );
};
export default CounterParties;
