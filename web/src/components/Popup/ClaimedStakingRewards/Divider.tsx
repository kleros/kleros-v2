import React from "react";
import styled from "styled-components";

const StyledHr = styled.hr`
  display: flex;
  border: none;
  height: 0.5px;
  background-color: ${({ theme }) => theme.stroke};
  margin: calc(8px + (18 - 8) * (min(max(100vw, 375px), 1250px) - 375px) / 875) 0px;
  width: 100%;
`;

const Divider: React.FC = () => {
  return <StyledHr />;
};
export default Divider;
