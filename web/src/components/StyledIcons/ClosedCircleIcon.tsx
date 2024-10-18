import React from "react";
import styled from "styled-components";
import ClosedCircle from "svgs/icons/close-circle.svg";

const StyledClosedCircle = styled(ClosedCircle)`
  path {
    fill: ${({ theme }) => theme.error};
  }
`;

const ClosedCircleIcon: React.FC = () => {
  return <StyledClosedCircle />;
};
export default ClosedCircleIcon;
