import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { Steps } from "@kleros/ui-components-library";

const StyledSteps = styled(Steps)`
  height: 360px;
`;

const Timeline: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const items = [
    { title: t("timeline.briefing"), subitems: [t("timeline.title"), t("timeline.description")] },
    {
      title: t("timeline.parameters"),
      subitems: [
        t("timeline.court"),
        t("timeline.category"),
        t("timeline.jurors"),
        t("timeline.voting_options"),
        t("timeline.notable_persons"),
      ],
    },
    { title: t("timeline.policy") },
    { title: t("timeline.preview") },
  ];

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
