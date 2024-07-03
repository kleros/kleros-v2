import React from "react";
import styled from "styled-components";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";

import PlusMinusField from "components/PlusMinusField";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../../NavigationButtons";

import PersonFields from "./PersonFields";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledPlusMinusField = styled(PlusMinusField)`
  align-self: start;
`;

const NotablePersons: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  //value here is the total number of fields-
  const updateNumberOfAliases = (value: number) => {
    const defaultAlias = { name: "", address: "", id: value.toString() };
    const aliases = disputeData.aliasesArray;

    if (isUndefined(aliases)) {
      return setDisputeData({ ...disputeData, aliasesArray: [defaultAlias] });
    }
    if (value < aliases?.length) return setDisputeData({ ...disputeData, aliasesArray: aliases.splice(0, value) });
    if (value > aliases?.length) return setDisputeData({ ...disputeData, aliasesArray: [...aliases, defaultAlias] });
  };

  return (
    <Container>
      <Header text="Notable Persons" />
      <PersonFields />
      <StyledPlusMinusField
        currentValue={disputeData.aliasesArray?.length ?? 2}
        updateValue={updateNumberOfAliases}
        minValue={2}
      />
      <NavigationButtons prevRoute="/resolver/voting-options" nextRoute="/resolver/policy" />
    </Container>
  );
};
export default NotablePersons;
