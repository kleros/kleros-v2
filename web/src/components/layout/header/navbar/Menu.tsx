import React from "react";
import styled from "styled-components";

const Container = styled.div``;

const ButtonContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
`;

const StyledButton = styled.button`
  border: none;
  background-color: transparent;
  p {
    margin: 0;
  }
`;

const buttons = [
  { text: "Notifications", icon: "Cases" },
  { text: "Settings", icon: "Courts" },
  { text: "Help", icon: "Dashboard" },
  { text: "Dark Mode", icon: "Dashboard" },
];

const Explore: React.FC = () => (
  <Container>
    {buttons.map(({ text }) => (
      <ButtonContainer key={text}>
        <StyledButton>
          <p>{text}</p>
        </StyledButton>
      </ButtonContainer>
    ))}
  </Container>
);

export default Explore;
