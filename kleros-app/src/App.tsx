import { createRoot } from "react-dom/client";
import React from "react";

const App = () => {
  return (
    <React.StrictMode>
      <div>
        <h1>Kleros</h1>
      </div>
    </React.StrictMode>
  );
};

const app = document.getElementById("app");
if (app) {
  const root = createRoot(app);
  root.render(<App />);
}
