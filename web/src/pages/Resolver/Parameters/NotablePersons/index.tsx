import React from "react";
import Header from "pages/Resolver/Header";
import styled from "styled-components";
import NavigationButtons from "../../NavigationButtons";
import PlusMinusField from "components/PlusMinusField";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";
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
    let defaultAlias = { name: "", address: "", id: value.toString() };
    let aliases = disputeData.aliases;

    if (isUndefined(aliases)) {
      return setDisputeData({ ...disputeData, aliases: [defaultAlias] });
    }
    if (value < aliases?.length) return setDisputeData({ ...disputeData, aliases: aliases.splice(0, value) });
    if (value > aliases?.length) return setDisputeData({ ...disputeData, aliases: [...aliases, defaultAlias] });
  };

  return (
    <Container>
      <Header text="Notable Persons" />
      <PersonFields />
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
