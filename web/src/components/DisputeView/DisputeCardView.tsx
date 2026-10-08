import React from "react";

import { Link } from "react-router-dom";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";
import { isUndefined } from "utils/index";

import { StyledSkeleton } from "components/StyledSkeleton";

import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";

interface ITruncatedTitle {
  text: string;
  maxLength: number;
}
const TruncatedTitle = ({ text, maxLength }: ITruncatedTitle) => {
  const truncatedText = text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
  return (
    <h3 dir="auto" className="mb-5">
      {truncatedText}
    </h3>
  );
};

interface IDisputeCardView {
  title: string;
  disputeID?: string;
  courtId?: string;
  court?: string;
  category?: string;
  rewards?: string;
  period?: Periods;
  date?: number;
  round?: number;
  isOverview?: boolean;
  showLabels?: boolean;
  isLoading?: boolean;
}

const DisputeCardView: React.FC<IDisputeCardView> = ({ isLoading, ...props }) => {
  return (
    <Link to={`/cases/${props?.disputeID?.toString()}`}>
      <Card hover className="[transition:0.1s] w-full h-full min-h-[290px]">
        {!isUndefined(props?.period) && <PeriodBanner id={parseInt(props?.disputeID ?? "0")} period={props.period} />}
        <div className="h-[calc(100%_-_45px)] p-[20px_16px] flex flex-col justify-between lg:p-[20px_24px]">
          {isLoading ? <StyledSkeleton className="mb-5" /> : <TruncatedTitle text={props?.title} maxLength={100} />}
          <DisputeInfo {...props} />
        </div>
      </Card>
    </Link>
  );
};

export default DisputeCardView;
