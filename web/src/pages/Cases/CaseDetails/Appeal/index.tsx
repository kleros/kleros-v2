import React from "react";
import ClassicWrapper from "./Classic";
import { Periods } from "consts/periods";

const Appeal: React.FC<{ currentPeriodIndex: number }> = ({ currentPeriodIndex }) =>
  Periods.appeal === currentPeriodIndex ? <ClassicWrapper /> : <h2>Not in appeal period</h2>;

export default Appeal;
