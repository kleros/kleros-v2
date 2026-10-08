import React, { useEffect, useState } from "react";

import { useDebounce } from "react-use";

import { TextField } from "@kleros/ui-components-library";

import { useDisputeTemplateFromId } from "hooks/queries/useDisputeTemplateFromId";
import { isUndefined } from "utils/isUndefined";

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
  const { data: templateFromId, isLoading, error } = useDisputeTemplateFromId(debouncedTemplateId);

  useEffect(() => {
    const templateData = templateFromId?.disputeTemplate?.templateData;
    const templateDataMappings = templateFromId?.disputeTemplate?.templateDataMappings;
    if (!isUndefined(templateData)) setDisputeTemplateInput(tryPrettify(templateData));
    if (!isUndefined(templateDataMappings)) setDataMappingsInput(tryPrettify(templateDataMappings));
    if (error) {
      console.error("Error fetching template:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateFromId, error]);

  return (
    <div className="ml-6 mt-6 flex flex-col">
      <h2 className="mt-6">Fetch dispute template from template ID</h2>
      <TextField
        aria-label="Template ID"
        inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
        value={templateId}
        placeholder="Enter template Id"
        message={isLoading ? "fetching ..." : ""}
        onChange={setTemplateId}
      />
    </div>
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
