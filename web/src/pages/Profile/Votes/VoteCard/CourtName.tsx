import React from "react";

import { InternalLink } from "components/InternalLink";

interface ICourtName {
  name: string;
  courtId: string;
}

const CourtName: React.FC<ICourtName> = ({ name, courtId }) => {
  return (
    <div className="flex w-full flex-row gap-[8px_16px] items-center justify-between flex-wrap lg:justify-start lg:w-full lg:overflow-hidden">
      <InternalLink
        to={`/courts/${courtId}`}
        className="text-[14px] font-normal text-klerosUIComponentsPrimaryBlue no-underline cursor-pointer h-full lg:overflow-hidden lg:[text-overflow:ellipsis] lg:whitespace-nowrap lg:block [&:hover]:text-klerosUIComponentsSecondaryBlue"
      >
        {name}
      </InternalLink>
    </div>
  );
};
export default CourtName;
