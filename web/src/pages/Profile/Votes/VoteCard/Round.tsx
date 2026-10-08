import React from "react";

import { useTranslation } from "react-i18next";

import RoundIcon from "svgs/icons/round.svg";

interface IRound {
  number: string;
}

const Round: React.FC<IRound> = ({ number }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 [&_small]:font-normal">
      <RoundIcon />
      <small>{t("voting.round_number", { number })}</small>
    </div>
  );
};
export default Round;
