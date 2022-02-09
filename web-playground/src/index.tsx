import React from "react";
import ReactDOM from "react-dom";
import { DAppProvider } from "@usedapp/core";
import App from "./app";

const WebApp = () => (
  <React.StrictMode>
    <DAppProvider config={{}}>
      <App />
    </DAppProvider>
  </React.StrictMode>
);

const app = document.getElementById("app");
ReactDOM.render(<WebApp />, app);
