import React from "react";
import styled from "styled-components";

const StyledLabel = styled.label`
  width: calc(40px + (220 - 40) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const JurorTitle: React.FC = () => <StyledLabel>Juror</StyledLabel>;
export default JurorTitle;
