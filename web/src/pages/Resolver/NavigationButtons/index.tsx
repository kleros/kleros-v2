import React from "react";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { isUndefined } from "src/utils";

import NextButton from "./NextButton";
import PreviousButton from "./PreviousButton";
import SubmitBatchDisputesButton from "./SubmitBatchDisputesButton";
import SubmitDisputeButton from "./SubmitDisputeButton";

interface NavigationButtonsProps {
  prevRoute: string;
  nextRoute?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ prevRoute, nextRoute }) => {
  const { isBatchCreation } = useNewDisputeContext();

  const SubmitButton = isBatchCreation ? SubmitBatchDisputesButton : SubmitDisputeButton;
  return (
    <div className="flex gap-6 mt-[calc(32px_+_(24_-_32)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] flex-wrap justify-center">
      <PreviousButton prevRoute={prevRoute} />
      {isUndefined(nextRoute) ? <SubmitButton /> : <NextButton nextRoute={nextRoute} />}
    </div>
  );
};

export default NavigationButtons;
