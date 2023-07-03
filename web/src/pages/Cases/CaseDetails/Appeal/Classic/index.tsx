import React from "react";
import { ClassicAppealProvider } from "hooks/useClassicAppealContext";
import Options from "./Options";
import Fund from "./Fund";

const Classic: React.FC = () => (
  <ClassicAppealProvider>
    <h1>Appeal crowdfunding</h1>
    <label> The jury decision is appealed when two options are fully funded. </label>
    <Options />
    <Fund />
  </ClassicAppealProvider>
);

export default Classic;
