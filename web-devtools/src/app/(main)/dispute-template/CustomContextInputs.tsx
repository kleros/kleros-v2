import retrieveVariables from "@kleros/kleros-sdk/src/dataMappings/utils/retrieveVariables";
import { Field } from "@kleros/ui-components-library";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useDebounce } from "react-use";
import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
`;

const Header = styled.h2`
  margin: 0;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;
const VariableName = styled.p`
  font-family: "Roboto Mono", monospace;
`;

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
  const [customContext, setCustomContextInputs] = useState<Record<string, string>>();

  const requiredVariables = useMemo(() => retrieveVariables(dataMapping), [dataMapping]);

  useDebounce(
    () => {
      if (!customContext) return;
      setCustomContext(customContext);
    },
    300,
    [customContext]
  );

  return requiredVariables.length ? (
    <Container>
      <WithHelpTooltip tooltipMsg="These are additional variables required by the data mapping to be passed as initial context. Please ignore the variables that will come from the result of the preceeding data mappings">
        <Header>Additional Context</Header>
      </WithHelpTooltip>
      {requiredVariables.map((variable, index) =>
        DisputeRequestParams.includes(variable) ? null : (
          <InputContainer id={`${variable}-${index}`}>
            <VariableName>{variable}:</VariableName>
            <Field
              type="text"
              name={variable}
              value={customContext?.[variable]}
              onChange={(e) => {
                setCustomContextInputs((prev) => ({ ...prev, [variable]: e.target.value }));
              }}
              placeholder="0x..."
            />
          </InputContainer>
        )
      )}
    </Container>
  ) : null;
};

export default CustomContextInputs;
