import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const msg = automaticVoteReveal ? t("popups.enable_notifications_progress") : t("popups.enable_notifications_reveal");
  return <StyledInfoCard msg={msg} />;
};

export default VoteWithCommitExtraInfo;
