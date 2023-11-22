import React from "react";
import styled from "styled-components";
import Icon from "svgs/icons/kleros.svg";

const StyledIcon = styled(Icon)`
  path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
  width: calc(120px + (160 - 120) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  height: calc(132px + (140 - 132) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const KlerosIcon: React.FC = () => {
  return <StyledIcon />;
};
export default KlerosIcon;
