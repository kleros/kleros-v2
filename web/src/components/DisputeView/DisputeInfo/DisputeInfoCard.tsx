import React from "react";

import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import Field, { IField } from "components/Field";

import CardLabel from "../CardLabels";

import { FieldItem, IDisputeInfo } from "./index";

const StyledField = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Field>) => (
  <Field
    {...props}
    className={cn(
      "max-w-full [&_label.value]:overflow-hidden [&_label.value]:[text-overflow:ellipsis]",
      "[&_label.value]:[text-wrap:auto]",
      className
    )}
  />
);

type IDisputeInfoCard = { fieldItems: FieldItem[] } & IDisputeInfo;

const DisputeInfoCard: React.FC<IDisputeInfoCard> = ({ isOverview, showLabels, fieldItems, disputeID, round }) => {
  return (
    <div className="flex w-full flex-col justify-end">
      <div
        className={cn(
          "flex size-full flex-col items-center justify-center gap-2",
          isOverview && "lg:flex-row lg:flex-wrap lg:justify-start lg:gap-8"
        )}
      >
        {fieldItems.map((item) =>
          item.display ? <StyledField key={item.name} {...(item as IField)} {...{ isOverview }} /> : null
        )}
      </div>
      {showLabels && !isUndefined(disputeID) && !isUndefined(round) ? (
        <CardLabel disputeId={disputeID} round={round - 1} />
      ) : null}
    </div>
  );
};
export default DisputeInfoCard;
