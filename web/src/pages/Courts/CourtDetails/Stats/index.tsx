import React from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";

import { Accordion } from "@kleros/ui-components-library";

import { CoinIds } from "consts/coingecko";
import { useCoinPrice } from "hooks/useCoinPrice";
import useIsDesktop from "hooks/useIsDesktop";

import { useCourtDetails } from "queries/useCourtDetails";

import { landscapeStyle } from "styles/landscapeStyle";

import StatsContent from "./StatsContent";
import Spinner from "components/Spinner";

const Container = styled.div`
  padding: 0 24px 12px 24px;
`;

const Header = styled.h3`
  color: ${({ theme }) => theme.primaryText};
  font-weight: 600;
  margin: 0;
`;

const StyledAccordion = styled(Accordion)`
  > * > button {
    padding: 12px 16px !important;
    justify-content: unset;
  }
  //adds padding to body container
  > * > div > div {
    padding: 0 8px 8px;
  }
  [class*="accordion-item"] {
    margin: 0;
  }

  ${landscapeStyle(
    () => css`
      > * > div > div {
        padding: 0 24px;
      }
      > * > button {
        padding: 12px 24px !important;
      }
    `
  )}
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: ${({ theme }) => theme.error};
  font-size: 16px;
  font-weight: 500;
`;

const Stats = () => {
  const { id } = useParams();
  const { data, isLoading: isLoadingCourt, error: courtError } = useCourtDetails(id);
  const coinIds = [CoinIds.PNK, CoinIds.ETH];
  const { prices: pricesData, isLoading: isLoadingPrices, error: pricesError } = useCoinPrice(coinIds);
  const isDesktop = useIsDesktop();

  if (isLoadingCourt || isLoadingPrices) {
    return <Spinner />;
  }

  if (courtError || pricesError) {
    return <ErrorMessage>Failed to load statistics</ErrorMessage>;
  }

  return isDesktop ? (
    <Container>
      <Header>Statistics</Header>
      <StatsContent court={data?.court} {...{ pricesData, coinIds }} />
    </Container>
  ) : (
    <StyledAccordion
      defaultExpanded={0}
      items={[
        {
          title: "Statistics",
          body: <StatsContent court={data?.court} {...{ pricesData, coinIds }} />,
        },
      ]}
    ></StyledAccordion>
  );
};

export default Stats;
