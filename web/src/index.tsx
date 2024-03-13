import React from "react";

import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import { HashRouter } from "react-router-dom";

import App from "./app";

const container = document.getElementById("app");
Modal.setAppElement(container!);
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
