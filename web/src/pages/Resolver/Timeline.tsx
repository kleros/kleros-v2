import React from "react";
import styled from "styled-components";

import { useLocation } from "react-router-dom";

import { Steps } from "@kleros/ui-components-library";

const StyledSteps = styled(Steps)`
  height: 360px;
`;

const items = [
  { title: "Briefing", subitems: ["Title", "Description"] },
  { title: "Parameters", subitems: ["Court", "Category", "Jurors", "Voting Options", "Notable Persons"] },
  { title: "Policy" },
  { title: "Preview" },
];

const Timeline: React.FC = () => {
  const location = useLocation();

  const routeToIndexMap = {
    "/resolver/title": 0,
    "/resolver/description": 0,
    "/resolver/court": 1,
    "/resolver/category": 1,
    "/resolver/jurors": 1,
    "/resolver/voting-options": 1,
    "/resolver/notable-persons": 1,
    "/resolver/policy": 2,
    "/resolver/preview": 3,
  };

  const currentItemIndex = Object.entries(routeToIndexMap).reduce(
    (acc, [route, index]) => (location.pathname.includes(route) ? index : acc),
    0
  );

  return <StyledSteps {...{ items, currentItemIndex }} />;
};

export default Timeline;
