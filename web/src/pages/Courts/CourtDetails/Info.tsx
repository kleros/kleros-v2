import React from "react";
import styled from "styled-components";
import InfoCircle from "svgs/icons/info-circle.svg";

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const StyledSpan = styled.span`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 14px;
`;

const StyledInfoCircle = styled(InfoCircle)`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const Info: React.FC = () => {
  return (
    <Container>
      <StyledInfoCircle />
      <StyledSpan>Note that past performance is not a guarantee of future results.</StyledSpan>
    </Container>
  );
};
export default Info;
