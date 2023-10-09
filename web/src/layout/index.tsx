import React, { useRef } from "react";
import styled from "styled-components";
import "overlayscrollbars/styles/overlayscrollbars.css";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { OverlayScrollContext } from "context/OverlayScrollContext";
import Header from "./Header";
import Footer from "./Footer";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
`;

const StyledOverlayScrollbarsComponent = styled(OverlayScrollbarsComponent)`
  height: 100vh;
  width: 100vw;
`;

const StyledToastContainer = styled(ToastContainer)`
  padding: 16px;
  padding-top: 70px;
`;

const OutletContainer = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.lightBackground};
`;

const Layout: React.FC = () => {
  const containerRef = useRef(null);

  return (
    <OverlayScrollContext.Provider value={containerRef}>
      <StyledOverlayScrollbarsComponent ref={containerRef} options={{ showNativeOverlaidScrollbars: true }}>
        <Container>
          <Header />
          <StyledToastContainer />
          <OutletContainer>
            <Outlet />
          </OutletContainer>

          <Footer />
        </Container>
      </StyledOverlayScrollbarsComponent>
    </OverlayScrollContext.Provider>
  );
};

export default Layout;
