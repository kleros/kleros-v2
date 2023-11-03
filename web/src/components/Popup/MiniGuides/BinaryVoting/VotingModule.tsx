import React from "react";
import DarkModeVotingModuleImage from "tsx:assets/svgs/mini-guides/binary-voting/voting-module-dark-mode.svg";
import LightModeVotingModuleImage from "tsx:assets/svgs/mini-guides/binary-voting/voting-module-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const VotingModule: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeVotingModuleImage} lightModeImage={LightModeVotingModuleImage} />
);

export default VotingModule;
