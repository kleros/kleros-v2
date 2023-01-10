import React from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "hooks/useWeb3";
import StageExplainer from "./StageExplainer";
import Options from "./Options";
import Fund from "./Fund";

const Classic: React.FC = () => {
  const { account } = useWeb3();
  const { id } = useParams();
  return (
    <>
      <h1>Appeal crowdfunding</h1>
      <label>
        The jury decision is appealed when stages 1 and 2 are fully funded
      </label>
      <StageExplainer />
      <Options />
      <Fund />
    </>
  );
};

export default Classic;
