import React from "react";
import styled from "styled-components";
import InfoCard from "components/InfoCard";
import { responsiveSize } from "styles/responsiveSize";

const StyledInfoCard = styled(InfoCard)`
  margin: ${responsiveSize(8, 24, 300)} ${responsiveSize(8, 32, 300)} 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 19px;
`;

const VoteWithCommitExtraInfo: React.FC = () => {
  return <StyledInfoCard msg="Subscribe to receive notifications to be reminded when the reveal time comes." />;
};
export default VoteWithCommitExtraInfo;
