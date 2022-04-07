import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "components/layout";
import Home from "./pages/home";

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="cases" element={<h1>Cases</h1>} />
      <Route path="courts" element={<h1>Courts</h1>} />
      <Route path="dashboard" element={<h1>Dashboard</h1>} />
      <Route
        path="*"
        element={<h1>Justice not found here ¯\_( ͡° ͜ʖ ͡°)_/¯</h1>}
      />
    </Route>
  </Routes>
);

export default App;
