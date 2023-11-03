import React from "react";
import DarkModeCrowdfundAppealImage from "tsx:assets/svgs/mini-guides/appeal/crowdfund-appeal-dark-mode.svg";
import LightModeCrowdfundAppealImage from "tsx:assets/svgs/mini-guides/appeal/crowdfund-appeal-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const CrowdfundAppeal: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeCrowdfundAppealImage} lightModeImage={LightModeCrowdfundAppealImage} />
);

export default CrowdfundAppeal;
