import React from "react";
import { Routes as _Routes, Route } from "react-router-dom";
import Home from "src/pages/home";

const Routes: React.FC = () => (
  <_Routes>
    <Route path="/" element={<Home />} />
    <Route path="/cases" element={<></>} />
    <Route path="/courts" element={<></>} />
    <Route path="/dashboard" element={<></>} />
  </_Routes>
);

export default Routes;
