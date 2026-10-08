import React, { useMemo, useState } from "react";

import { useDebounce } from "react-use";

import retrieveVariables from "@kleros/kleros-sdk/src/dataMappings/utils/retrieveVariables";
import { TextField } from "@kleros/ui-components-library";

import WithHelpTooltip from "components/WithHelpTooltip";

// prevent duplicating input fields
const DisputeRequestParams = [
  "arbitrator",
  "arbitrable",
  "arbitratorDisputeID",
  "externalDisputeID",
  "templateID",
  "templateUri",
];

interface ICustomContextInputs {
  dataMapping: string;
  setCustomContext: (context: Record<string, string>) => void;
}
const CustomContextInputs: React.FC<ICustomContextInputs> = ({ dataMapping, setCustomContext }) => {
  const [customContextInputs, setCustomContextInputs] = useState<Record<string, string>>();

  const requiredVariables = useMemo(() => {
    try {
      return retrieveVariables(dataMapping);
    } catch (error) {
      console.error("Failed to parse dataMapping:", error);
      return [];
    }
  }, [dataMapping]);

  useDebounce(
    () => {
      if (!customContextInputs) return;
      setCustomContext(customContextInputs);
    },
    300,
    [customContextInputs]
  );

  return requiredVariables.length ? (
    <div className="mt-8 flex w-full flex-col gap-4">
      <WithHelpTooltip
        tooltipMsg={
          "These are additional variables required by the data mapping to be passed as initial context. " +
          "Please ignore the variables that will come from the result of the preceeding data mappings"
        }
      >
        <h2 className="m-0">Additional Context</h2>
      </WithHelpTooltip>
      {requiredVariables.map((variable, index) =>
        DisputeRequestParams.includes(variable) ? null : (
          <div className="flex flex-wrap gap-4" key={`${variable}-${index}`}>
            <p className="font-['Roboto_Mono',monospace]">{variable}:</p>
            <TextField
              aria-label={variable}
              inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
              type="text"
              name={variable}
              value={customContextInputs?.[variable]}
              onChange={(value) => {
                setCustomContextInputs((prev) => ({ ...prev, [variable]: value }));
              }}
              placeholder="0x..."
            />
          </div>
        )
      )}
    </div>
  ) : null;
};

export default CustomContextInputs;
