import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import { useNewDisputeContext } from "~src/context/NewDisputeContext";
import { wrapWithToast } from "utils/wrapWithToast";
import {
  useDisputeResolverCreateDisputeForTemplate,
  usePrepareDisputeResolverCreateDisputeForTemplate,
} from "hooks/contracts/generated";
import { prepareArbitratorExtradata } from "~src/utils/prepareArbitratorExtradata";
import { usePublicClient } from "wagmi";
const StyledButton = styled(Button)``;

const SubmitDisputeButton: React.FC = () => {
  const publicClient = usePublicClient();
  const { disputeTemplate, disputeData, resetDisputeData } = useNewDisputeContext();

  const { config: submitCaseConfig } = usePrepareDisputeResolverCreateDisputeForTemplate({
    enabled: true, //TODO : decide better condition for enabled
    args: [
      prepareArbitratorExtradata(disputeData.courtId, disputeData.numberOfJurors, 1), //TODO: decide which dispute kit to use
      JSON.stringify(disputeTemplate),
      "TODO: mappings",
      BigInt(disputeData.numberOfRulingOptions),
    ],
    value: BigInt(disputeData.arbitrationCost ?? 0),
  });

  const { writeAsync: submitCase } = useDisputeResolverCreateDisputeForTemplate(submitCaseConfig);

  return (
    <StyledButton
      text="Submit the case"
      onClick={() => {
        if (submitCase) {
          wrapWithToast(async () => await submitCase().then((response) => response.hash), publicClient)
            .then(() => {
              resetDisputeData();
            })
            .finally(() => {
              console.log("settled");
            });
        }
      }}
    />
  );
};

export default SubmitDisputeButton;
