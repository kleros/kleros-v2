import React from "react";
import styled from "styled-components";
import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  padding: 8px 0px;
`;

const Title = styled.h2`
  margin: 0;
`;

const Header: React.FC<{ text: string; tooltipMsg: string }> = ({ text, tooltipMsg }) => (
  <Container>
    <WithHelpTooltip tooltipMsg={tooltipMsg} place="right">
      <Title>{text}</Title>
    </WithHelpTooltip>
  </Container>
);

export default Header;
