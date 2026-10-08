import React from "react";

import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import "@kleros/ui-components-library/style.css";
import "styles/global.css";

import Footer from "layout/Footer";
import Header from "layout/Header";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Tools",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en" className="dark">
      <body className={font.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
