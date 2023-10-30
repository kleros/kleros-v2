import React from "react";
import styled from "styled-components";
import BookOpenIcon from "tsx:assets/svgs/icons/book-open.svg";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
`;

const Rewards: React.FC = () => (
  <Container>
    <BookOpenIcon />
    <StyledLabel>How it works</StyledLabel>
  </Container>
);
export default Rewards;
