import React from "react";

import { Tooltip } from "@kleros/ui-components-library";

interface IScore {
  coherenceScore: string;
}

const Score: React.FC<IScore> = ({ coherenceScore }) => {
  return (
    <div className="flex items-center font-semibold text-klerosUIComponentsPrimaryText flex-wrap justify-center mt-0.5">
      <Tooltip text={coherenceScore}>{coherenceScore}</Tooltip>
    </div>
  );
};

export default Score;
