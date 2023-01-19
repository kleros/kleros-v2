import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "hooks/useWeb3";
import Options from "./Options";
import Fund from "./Fund";

const Classic: React.FC = () => {
  const { account } = useWeb3();
  const { id } = useParams();
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  return (
    <>
      <h1>Appeal crowdfunding</h1>
      <label>
        The jury decision is appealed when two options are fully funded.
      </label>
      <Options {...{ selectedOption, setSelectedOption }} />
      <Fund />
    </>
  );
};

export default Classic;
