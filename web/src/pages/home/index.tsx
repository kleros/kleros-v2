import React from "react";
import styled from "styled-components";
import Stats from "./Stats";

const Container = styled.div`
  width: 100vw;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Home: React.FC = () => (
  <Container>
    <Stats />
  </Container>
);

export default Home;
