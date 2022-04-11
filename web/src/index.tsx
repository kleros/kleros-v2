import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { HashRouter as Router } from "react-router-dom";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
