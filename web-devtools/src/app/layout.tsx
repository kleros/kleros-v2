import React from "react";

import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import StyledComponentsProvider from "context/StyledComponentsProvider";
import StyledComponentsRegistry from "context/StyledComponentsRegistry";

import Footer from "layout/Footer";
import Header from "layout/Header";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Tools",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en">
      <body className={font.className}>
        <StyledComponentsRegistry>
          <StyledComponentsProvider>
            <Header />
            {children}
            <Footer />
          </StyledComponentsProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
