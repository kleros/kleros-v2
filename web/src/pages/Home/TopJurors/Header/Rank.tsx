import React from "react";
import styled from "styled-components";

const StyledLabel = styled.label`
  width: calc(16px + (24 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Rank: React.FC = () => <StyledLabel>#</StyledLabel>;

export default Rank;
