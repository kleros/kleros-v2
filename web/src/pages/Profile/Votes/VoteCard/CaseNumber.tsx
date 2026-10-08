import React from "react";

import { useTranslation } from "react-i18next";

import { InternalLink } from "components/InternalLink";

interface ICaseNumber {
  id: string;
}

const CaseNumber: React.FC<ICaseNumber> = ({ id }) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-row gap-[8px_16px] items-center justify-between flex-wrap [&_small]:h-full [&_small]:font-semibold lg:justify-start lg:w-auto">
      <InternalLink to={`/cases/${id?.toString()}`} className="font-semibold">
        {t("misc.case_number", { id })}
      </InternalLink>
    </div>
  );
};
export default CaseNumber;
