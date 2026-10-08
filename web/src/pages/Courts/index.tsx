import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import CourtDetails from "./CourtDetails";

const Courts: React.FC = () => {
  return (
    <div className="w-full bg-klerosUIComponentsLightBackground p-[32px_16px_40px] max-w-[1400px] m-[0_auto] lg:p-[48px_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_60px]">
      <Routes>
        <Route path="/:id/*" element={<CourtDetails />} />
        <Route path="*" element={<Navigate to="1" replace />} />
      </Routes>
    </div>
  );
};

export default Courts;
