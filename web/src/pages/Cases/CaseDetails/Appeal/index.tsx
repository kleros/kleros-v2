import React from "react";
import Classic from "./Classic";
import { Periods } from "consts/periods";
import AppealHistory from "./AppealHistory";
import { ClassicAppealProvider } from "hooks/useClassicAppealContext";

const Appeal: React.FC<{ currentPeriodIndex: number }> = ({ currentPeriodIndex }) => {
  return (
    <ClassicAppealProvider>
      {Periods.appeal === currentPeriodIndex ? <Classic /> : <AppealHistory />}
    </ClassicAppealProvider>
  );
};

export default Appeal;
