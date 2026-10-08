import React from "react";

import { Tooltip } from "@kleros/ui-components-library";

import { getCoherencePercent } from "utils/getCoherencePercent";

interface ICoherence {
  totalCoherentVotes: string;
  totalResolvedVotes: string;
}

const Coherence: React.FC<ICoherence> = ({ totalCoherentVotes, totalResolvedVotes }) => {
  const coherenceRatio = `${totalCoherentVotes}/${totalResolvedVotes}`;

  return (
    <div className="flex items-center font-semibold text-klerosUIComponentsPrimaryText flex-wrap justify-center mt-0.5">
      <Tooltip text={getCoherencePercent(Number(totalCoherentVotes), Number(totalResolvedVotes))}>
        {coherenceRatio}
      </Tooltip>
    </div>
  );
};

export default Coherence;
