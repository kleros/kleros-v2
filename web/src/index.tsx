import React from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from "./app";
import Modal from "react-modal";
import { HashRouter as Router } from "react-router-dom";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_ENDPOINT,
  environment: process.env.REACT_APP_CONTEXT,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const container = document.getElementById("app");
Modal.setAppElement(container!);
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
