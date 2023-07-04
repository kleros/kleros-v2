import React from "react";
import styled from "styled-components";
import { Timeline } from "@kleros/ui-components-library";
import { useKlerosCoreCurrentRuling } from "hooks/contracts/generated";

const StyledTimeline = styled(Timeline)`
  margin: 0px 100px;
`;

interface IDisputeTimeline {
  id: string;
  disputeTemplate: any;
}

const DisputeTimeline: React.FC<IDisputeTimeline> = ({ id, disputeTemplate }) => {
  const { data: currentRulingArray } = useKlerosCoreCurrentRuling({ args: [BigInt(id)], watch: true });
  const currentRuling = Number(currentRulingArray?.[0]);

  const answer = disputeTemplate?.answers?.[currentRuling!];
  return (
    <div>
      <StyledTimeline
        items={[
          {
            title: "Pay 200 DAI",
            party: "alice.eth",
            subtitle: "08 Jan 2019 03:00 UTC",
            rightSided: true,
            variant: "accepted",
          },
          {
            title: "Pay 250 DAI",
            party: "bob.eth",
            subtitle: "08 Jan 2019 02:00 UTC",
            rightSided: true,
            variant: "purple",
          },
        ]}
      />
    </div>
  );
};
export default DisputeTimeline;
