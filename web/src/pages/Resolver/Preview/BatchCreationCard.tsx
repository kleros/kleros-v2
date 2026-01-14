import React, { useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useDebounce } from "react-use";

import { Card, Switch } from "@kleros/ui-components-library";

import { CoinIds } from "consts/coingecko";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { useCoinPrice } from "hooks/useCoinPrice";
import { formatETH, formatUnitsWei, formatUSD } from "utils/format";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";

import { Divider } from "components/Divider";
import PlusMinusField from "components/PlusMinusField";
import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled(Card)`
  width: 100%;
  height: fit-content;
`;

const TopContent = styled.div`
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;

  span::before {
    background-color: ${({ theme }) => theme.whiteBackground} !important;
  }
  ${landscapeStyle(
    () => css`
      padding: 0px 32px;
    `
  )}
`;

const BottomContent = styled.div`
  width: 100%;
  min-height: 64px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: start;
  gap: 16px;
  padding: 16px;

  ${landscapeStyle(
    () => css`
      justify-content: space-between;
      padding: 16px 32px;
    `
  )}
`;

const NumberDisplayContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  ${landscapeStyle(
    () => css`
      gap: 32px;
    `
  )}
`;

const NumberDisplay = styled.div`
  min-width: 64px;
  min-height: 64px;
  background-color: ${({ theme }) => theme.lightBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  font-size: 32px;
  color: ${({ theme }) => theme.primaryBlue};
  text-align: center;
  align-content: center;
`;

const Label = styled.p`
  padding: 0;
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.secondaryText};
`;

const Value = styled(Label)`
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
`;

const StyledPlusMinusField = styled(PlusMinusField)`
  margin: 0;
  path {
    fill: ${({ theme }) => theme.whiteBackground};
  }
`;

const StyledP = styled.p`
  padding: 0;
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.primaryText};
`;

const InfosContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const Info = styled.div`
  display: flex;
  gap: 8px;
`;

const BatchCreationCard: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, isBatchCreation, setIsBatchCreation, batchSize, setBatchSize } = useNewDisputeContext();
  const [localBatchSize, setLocalBatchSize] = useState(batchSize);
  useDebounce(() => setBatchSize(localBatchSize), 500, [localBatchSize]);

  const { prices: pricesData } = useCoinPrice([CoinIds.ETH]);

  const coinPrice = !isUndefined(pricesData) ? pricesData[CoinIds.ETH]?.price : undefined;

  return (
    <Container>
      <TopContent>
        <Switch checked={isBatchCreation} onChange={() => setIsBatchCreation(!isBatchCreation)} />
        <WithHelpTooltip tooltipMsg={t("case_creation.batch_cases_tooltip")}>
          <StyledP>{t("case_creation.create_multiple_cases")}</StyledP>
        </WithHelpTooltip>
      </TopContent>
      {isBatchCreation ? (
        <>
          <Divider />
          <BottomContent>
            <NumberDisplayContainer>
              <NumberDisplay>{localBatchSize}</NumberDisplay>
              <StyledPlusMinusField
                minValue={2}
                currentValue={localBatchSize}
                updateValue={(val) => setLocalBatchSize(val)}
              />
              <Label>({t("case_creation.number_of_cases_to_be_created")})</Label>
            </NumberDisplayContainer>
            <InfosContainer>
              <Info>
                <Label>{t("case_creation.jurors_per_case")}</Label>
                <Value>{disputeData.numberOfJurors}</Value>
              </Info>
              <Info>
                <Label>{t("case_creation.total")}</Label>
                <Value>{disputeData.numberOfJurors * localBatchSize}</Value>
              </Info>
              <Info>
                <Label>{t("case_creation.total_cost")}</Label>
                <Value>{formatETH(BigInt(disputeData.arbitrationCost ?? 0) * BigInt(localBatchSize))} ETH </Value>
                {!isUndefined(coinPrice) ? (
                  <Label>
                    ~
                    {formatUSD(
                      Number(formatUnitsWei(BigInt(disputeData.arbitrationCost ?? 0) * BigInt(localBatchSize))) *
                        coinPrice
                    )}
                  </Label>
                ) : null}
              </Info>
            </InfosContainer>
          </BottomContent>
        </>
      ) : null}
    </Container>
  );
};

export default BatchCreationCard;
