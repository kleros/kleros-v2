import React from "react";
import { Button } from "@kleros/ui-components-library";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import { PERIODS } from "./disputes-table";

const ExecuteButton: React.FC<{ dispute?: IKlerosCoreDisputeInfo }> = ({
  dispute,
}) => {
  return (
    <Button
      text="Execute Ruling"
      disabled={dispute?.ruled || dispute?.period !== PERIODS.execution}
    />
  );
};

export default ExecuteButton;
