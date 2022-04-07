import React from "react";
import styled from "styled-components";
import Header from "./header";
import Footer from "./footer";
import { Outlet } from "react-router-dom";

const Container = styled.div`
  height: 100vh;
  width: 100vw;
`;

const Layout: React.FC = () => (
  <Container>
    <Header />
    <Outlet />
    <Footer />
  </Container>
);

export default Layout;
