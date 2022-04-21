import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

const Container = styled.div`
  min-height: 100%;
  width: 100%;
`;

const Layout: React.FC = () => (
  <Container>
    <Header />
    <Outlet />
    <Footer />
  </Container>
);

export default Layout;
