import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100vw;
  height: 300px;
  background-color: ${({ theme }) => theme.lightBackground};
`;

const Home: React.FC = () => <Container>Hello world!</Container>;

export default Home;
