import React from "react";

import styled from "styled-components";

import DocIcon from "svgs/icons/doc.svg";

import { encodeURIFilter } from "utils/uri";
import { getDescriptiveCourtName } from "utils/getDescriptiveCourtName";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

const StyledDocIcon = styled(DocIcon)`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const IconAndTextContainer = styled.div`
  display: inline-block;
`;

interface IAllCasesButton {
  courtId?: string;
  courtName?: string;
}

const AllCasesButton: React.FC<IAllCasesButton> = ({ courtId, courtName }) => {
  const filter = courtId ? { court: courtId } : {};
  const link = `/cases/display/1/desc/${encodeURIFilter(filter)}`;
  const labelText = courtId ? `All Cases in ${getDescriptiveCourtName(courtName)}` : "All Cases";

  return (
    <InternalLink to={link}>
      <BlueIconTextButtonContainer>
        <IconAndTextContainer>
          <StyledDocIcon />
          {labelText}
        </IconAndTextContainer>
      </BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default AllCasesButton;
