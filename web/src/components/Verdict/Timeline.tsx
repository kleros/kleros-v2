import React from "react";
import styled from "styled-components";
import { Timeline } from "@kleros/ui-components-library";

interface IEvent {}

const StyledTimeline = styled(Timeline)`
  margin: 0px 100px;
`;

interface IDisputeTimeline {}

const DisputeTimeline: React.FC<IDisputeTimeline> = ({}) => {
  return (
    <div>
      {/* <StyledTimeline
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
      <StyledSteps
        items={[
          { title: "Escrow Details", subitems: ["Type of Escrow", "Title"] },
          { title: "Terms", subitems: ["Deliverable", "Payment", "Deadline"] },
          { title: "Preview" },
        ]}
        currentItemIndex={1}
      /> */}
    </div>
  );
};
export default DisputeTimeline;
