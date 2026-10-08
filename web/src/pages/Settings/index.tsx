import React from "react";

import { Route, Routes } from "react-router-dom";

import EmailConfirmation from "./EmailConfirmation";

const Settings: React.FC = () => {
  return (
    <div className="w-full bg-klerosUIComponentsLightBackground p-[calc(32px_+_(80_-_32)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_calc(24px_+_(136_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_calc(76px_+_(96_-_76)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] max-w-[1400px] m-[0_auto]">
      <Routes>
        <Route path="email-confirmation" element={<EmailConfirmation />} />
      </Routes>
    </div>
  );
};

export default Settings;
