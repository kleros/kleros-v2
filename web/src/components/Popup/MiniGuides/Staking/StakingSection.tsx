import React from "react";
import DarkModeStakingSectionImage from "tsx:assets/svgs/mini-guides/staking/staking-section-dark-mode.svg";
import LightModeStakingSectionImage from "tsx:assets/svgs/mini-guides/staking/staking-section-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const StakingSection: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeStakingSectionImage} lightModeImage={LightModeStakingSectionImage} />
);

export default StakingSection;
