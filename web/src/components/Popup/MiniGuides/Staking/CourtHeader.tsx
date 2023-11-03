import React from "react";
import DarkModeCourtHeaderImage from "tsx:assets/svgs/mini-guides/staking/court-header-dark-mode.svg";
import LightModeCourtHeaderImage from "tsx:assets/svgs/mini-guides/staking/court-header-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const CourtHeader: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeCourtHeaderImage} lightModeImage={LightModeCourtHeaderImage} />
);

export default CourtHeader;
