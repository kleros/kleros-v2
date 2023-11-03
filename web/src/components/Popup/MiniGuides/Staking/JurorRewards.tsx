import React from "react";
import DarkModeJurorRewardsImage from "tsx:assets/svgs/mini-guides/staking/juror-rewards-dark-mode.svg";
import LightModeJurorRewardsImage from "tsx:assets/svgs/mini-guides/staking/juror-rewards-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const JurorRewards: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeJurorRewardsImage} lightModeImage={LightModeJurorRewardsImage} />
);

export default JurorRewards;
