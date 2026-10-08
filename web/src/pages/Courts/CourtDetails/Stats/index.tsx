import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Accordion } from "@kleros/ui-components-library";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import useIsDesktop from "hooks/useIsDesktop";

import { useCourtDetails } from "queries/useCourtDetails";

import StatsContent from "./StatsContent";

const Stats = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = useCourtDetails(id);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData } = useCoinPrice(coinIds);
  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <div className="p-[0_24px_12px_24px]">
      <h3 className="text-klerosUIComponentsPrimaryText font-semibold m-0">{t("headers.statistics")}</h3>
      <StatsContent court={data?.court} {...{ pricesData, coinIds }} />
    </div>
  ) : (
    <Accordion
      defaultExpanded={0}
      items={[
        {
          title: t("headers.statistics"),
          body: <StatsContent court={data?.court} {...{ pricesData, coinIds }} />,
        },
      ]}
      className="[&_>_*_>_button]:p-[12px_16px]! [&_>_*_>_button]:[justify-content:unset] [&_>_*_>_div_>_div]:p-[0_8px_8px] [&_>_div]:m-0 lg:[&_>_*_>_div_>_div]:p-[0_24px] lg:[&_>_*_>_button]:p-[12px_24px]!"
    ></Accordion>
  );
};

export default Stats;
