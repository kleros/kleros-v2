import React from "react";
import { Button } from "@kleros/ui-components-library";
import { IKlerosCoreDisputeInfo } from "queries/useKlerosCoreDisputesQuery";
import { PERIODS } from "./disputes-table";

const DrawJurorsButton: React.FC<{ dispute?: IKlerosCoreDisputeInfo }> = ({
  dispute,
}) => {
  return (
    <Button
      text="Draw Jurors"
      disabled={dispute?.period !== PERIODS.evidence}
    />
  );
};

export default DrawJurorsButton;
