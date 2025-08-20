import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import InfoCard from "components/InfoCard";

const StyledInfoCard = styled(InfoCard)`
  margin: ${responsiveSize(8, 24, 300)} ${responsiveSize(8, 32, 300)} 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 19px;
`;

interface Props {
  automaticVoteReveal?: boolean;
}

const VoteWithCommitExtraInfo: React.FC<Props> = ({ automaticVoteReveal = false }) => {
  const msg = automaticVoteReveal
    ? "Enable notifications to be updated about the progress of the case: Settings > Notifications"
    : "Enable notifications to be reminded when the reveal time comes: Settings > Notifications";
  return <StyledInfoCard msg={msg} />;
};

export default VoteWithCommitExtraInfo;
