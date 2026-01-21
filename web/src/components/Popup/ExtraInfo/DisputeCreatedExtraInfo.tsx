import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  margin-top: ${responsiveSize(8, 24, 300)};
  margin-right: ${responsiveSize(8, 44, 300)};
  margin-left: ${responsiveSize(8, 44, 300)};
`;

const DisputeCreatedExtraInfo: React.FC = () => {
  const { t } = useTranslation();

  return <Container>{t("popups.subscribe_notifications_track")}</Container>;
};
export default DisputeCreatedExtraInfo;
