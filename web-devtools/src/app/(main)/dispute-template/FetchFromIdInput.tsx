import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useDebounce } from "react-use";

import { Field } from "@kleros/ui-components-library";

import { useDisputeTemplateFromId } from "hooks/queries/useDisputeTemplateFromId";
import { isUndefined } from "utils/isUndefined";

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
  defaultTemplateID: string;
}

const FetchFromIDInput: React.FC<IFetchFromID> = ({
  setDisputeTemplateInput,
  setDataMappingsInput,
  defaultTemplateID = "",
}) => {
  const [templateId, setTemplateId] = useState<string>("");
  const [debouncedTemplateId, setDebouncedTemplateId] = useState<string>("");
  useDebounce(
    () => {
      setDebouncedTemplateId(templateId);
    },
    1000,
    [templateId]
  );
  useEffect(() => setTemplateId(defaultTemplateID), [defaultTemplateID]);
  const { data: templateFromId, isLoading } = useDisputeTemplateFromId(debouncedTemplateId);

  useEffect(() => {
    const templateData = templateFromId?.disputeTemplate?.templateData;
    const templateDataMappings = templateFromId?.disputeTemplate?.templateDataMappings;
    if (!isUndefined(templateData)) setDisputeTemplateInput(tryPrettify(templateData));
    if (!isUndefined(templateDataMappings)) setDataMappingsInput(tryPrettify(templateDataMappings));
  }, [templateFromId]);

  return (
    <Container>
      <StyledHeader>Fetch dispute template from template ID</StyledHeader>
      <StyledInput
        value={templateId}
        placeholder="Enter template Id"
        message={isLoading ? "fetching ..." : ""}
        onChange={(e) => setTemplateId(e.target.value)}
      />
    </Container>
  );
};
// will try to format else will be repaired in editor
const tryPrettify = (text: string) => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};
export default FetchFromIDInput;
