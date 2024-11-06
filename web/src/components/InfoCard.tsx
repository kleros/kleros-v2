import React from "react";
import styled from "styled-components";

import InfoCircle from "svgs/icons/info-circle.svg";

import { responsiveSize } from "styles/responsiveSize";

const InfoContainer = styled.div`
  display: grid;
  grid-template-columns: 16px auto;
  gap: ${responsiveSize(6, 8, 300)};
  align-items: center;
  justify-items: start;
  text-align: start;
  color: ${({ theme }) => theme.secondaryText};
`;

interface IInfoCard {
  msg: string;
  className?: string;
}

const InfoCard: React.FC<IInfoCard> = ({ msg, className }) => {
  return (
    <InfoContainer {...{ className }}>
      <InfoCircle />
      {msg}
    </InfoContainer>
  );
};

export default InfoCard;
