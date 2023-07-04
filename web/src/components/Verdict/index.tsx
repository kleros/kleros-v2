import React from "react";
import styled from "styled-components";
import Identicon from "react-identicons";
import { useNavigate } from "react-router-dom";
import ArrowIcon from "assets/svgs/icons/arrow.svg";
import LightButton from "../LightButton";
import VerdictBanner from "./VerdictBanner";
import FinalDecision from "./FinalDecision";
// import { Timeline } from "@kleros/ui-components-library";
import DisputeTimeline from "./Timeline";

interface IVerdict {
  id: string;
  disputeDetails: any;
}

const Verdict: React.FC<IVerdict> = ({ id, disputeDetails }) => {
  return (
    <>
      <FinalDecision id={id} disputeDetails={disputeDetails} />
      {/* <Timeline items={[{ title: "hey", party: "asdasd", subtitle: "sad" }]} /> */}
      <DisputeTimeline />
    </>
  );
};
export default Verdict;
