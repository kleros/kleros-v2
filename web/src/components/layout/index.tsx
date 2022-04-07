import React from "react";
import styled from "styled-components";
import Header from "./header";
import Footer from "./footer";
import Routes from "src/routes";

const Container = styled.div`
  height: 100vh;
  width: 100vw;
`;

const Layout: React.FC = () => (
  <Container>
    <Header />
    <Routes />
    <Footer />
  </Container>
);

export default Layout;
