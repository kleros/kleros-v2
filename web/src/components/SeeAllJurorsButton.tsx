import React from "react";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

const SeeAllJurorsButton: React.FC = () => {
  return (
    <InternalLink to={"/jurors/1/desc/all"}>
      <BlueIconTextButtonContainer>
        <label>See all</label>
      </BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default SeeAllJurorsButton;
