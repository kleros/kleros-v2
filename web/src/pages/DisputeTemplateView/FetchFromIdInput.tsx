import { Field } from "@kleros/ui-components-library";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDisputeTemplateFromId } from "hooks/queries/useDisputeTemplateFromId";
import { isUndefined } from "utils/index";
import { useDebounce } from "react-use";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  margin-left: 24px;
`;

const StyledInput = styled(Field)``;
const StyledHeader = styled.h2`
  margin-top: 24px;
`;

interface IFetchFromID {
  setDisputeTemplateInput: (templateData: string) => void;
  setDataMappingsInput: (dataMappings: string) => void;
}

const FetchFromIDInput: React.FC<IFetchFromID> = ({ setDisputeTemplateInput, setDataMappingsInput }) => {
  const [templateId, setTemplateId] = useState<string>("");
  const [debouncedTemplateId, setDebouncedTemplateId] = useState<string>("");
  useDebounce(
    () => {
      setDebouncedTemplateId(templateId);
    },
    1000,
    [templateId]
  );
  const { data: templateFromId, isLoading } = useDisputeTemplateFromId(debouncedTemplateId);

  useEffect(() => {
    const templateData = templateFromId?.disputeTemplate?.templateData;
    const templateDataMappings = templateFromId?.disputeTemplate?.templateDataMappings;
    if (!isUndefined(templateData)) setDisputeTemplateInput(templateData);
    if (!isUndefined(templateDataMappings)) setDataMappingsInput(templateDataMappings);
  }, [templateFromId]);

  return (
    <Container>
      <StyledHeader>Fetch dispute template from template ID</StyledHeader>
      <StyledInput
        placeholder="Enter template Id"
        message={isLoading ? "fetching ..." : ""}
        onChange={(e) => setTemplateId(e.target.value)}
      />
    </Container>
  );
};

export default FetchFromIDInput;
