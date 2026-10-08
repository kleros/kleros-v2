import React from "react";

import { InternalLink } from "components/InternalLink";

interface ICourtName {
  name: string;
  id: string;
}

const CourtName: React.FC<ICourtName> = ({ name, id }) => {
  return (
    <div className="flex w-full flex-row gap-[8px_16px] items-center justify-between flex-wrap lg:w-full lg:overflow-hidden">
      <InternalLink
        to={`/courts/${id}`}
        className="text-[14px] font-semibold text-klerosUIComponentsPrimaryBlue no-underline cursor-pointer lg:overflow-hidden lg:[text-overflow:ellipsis] lg:whitespace-nowrap lg:block [&:hover]:text-klerosUIComponentsSecondaryBlue"
      >
        {name}
      </InternalLink>
    </div>
  );
};
export default CourtName;
