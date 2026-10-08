import React from "react";

import { Routes, Route } from "react-router-dom";

import CaseDetails from "./CaseDetails";
import CasesFetcher from "./CasesFetcher";

const Cases: React.FC = () => (
  <div className="w-full bg-klerosUIComponentsLightBackground p-[32px_16px_40px] max-w-[1400px] m-[0_auto] lg:p-[48px_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_60px]">
    <Routes>
      <Route path="/display/:page/:order/:filter" element={<CasesFetcher />} />
      <Route path="/:id/*" element={<CaseDetails />} />
    </Routes>
  </div>
);

export default Cases;
