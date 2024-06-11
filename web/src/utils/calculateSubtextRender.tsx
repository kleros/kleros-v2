import React from "react";

import { HomePageQuery } from "hooks/useHomePageContext";
import { isUndefined } from "utils/index";

import { CourtDetailsQuery } from "queries/useCourtDetails";

import { StyledSkeleton } from "components/StyledSkeleton";

export const calculateSubtextRender = (
  countersOrCourtData: CourtDetailsQuery["court"] | HomePageQuery["counters"],
  getSubtext: ((data: any, coinPrice: number) => string) | undefined,
  coinPrice: number
) => {
  if (!isUndefined(countersOrCourtData) && !isUndefined(getSubtext)) {
    return getSubtext(countersOrCourtData, coinPrice);
  } else if (getSubtext === undefined) {
    return "";
  }
  return <StyledSkeleton />;
};
