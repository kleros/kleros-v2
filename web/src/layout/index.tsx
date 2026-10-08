import React, { useRef } from "react";

import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/styles/overlayscrollbars.css";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { OverlayScrollContext } from "context/OverlayScrollContext";

import Footer from "./Footer";
import Header from "./Header";

const Layout: React.FC = () => {
  const containerRef = useRef(null);

  return (
    <OverlayScrollContext.Provider value={containerRef}>
      <OverlayScrollbarsComponent
        ref={containerRef}
        options={{ showNativeOverlaidScrollbars: true }}
        className="h-[100vh] w-[100vw]"
      >
        <div className="flex flex-col min-h-[100%] w-full">
          <Header />
          <ToastContainer className="p-4 pt-17.5" />
          <div className="flex flex-1 bg-klerosUIComponentsLightBackground">
            <Outlet />
          </div>

          <Footer />
        </div>
      </OverlayScrollbarsComponent>
    </OverlayScrollContext.Provider>
  );
};

export default Layout;
