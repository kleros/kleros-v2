import React from "react";

import { encodeURIFilter } from "utils/uri";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

interface ISeeAllCasesButton {
  courtId?: string;
}

const SeeAllCasesButton: React.FC<ISeeAllCasesButton> = ({ courtId }) => {
  const filter = courtId ? { court: courtId } : {};
  const link = `/cases/display/1/desc/${encodeURIFilter(filter)}`;
  const labelText = "See all";

  return (
    <InternalLink to={link}>
      <BlueIconTextButtonContainer>{labelText}</BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default SeeAllCasesButton;
