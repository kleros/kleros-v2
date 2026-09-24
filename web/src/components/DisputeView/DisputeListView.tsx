import React from "react";
import styled, { useTheme } from "styled-components";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";
import { formatDate } from "utils/date";
import { isUndefined } from "utils/index";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { BREAKPOINT_LANDSCAPE } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { InternalLink } from "components/InternalLink";
import { StyledSkeleton } from "components/StyledSkeleton";

import CardLabel from "./CardLabels";
import { getPeriodPhrase } from "./DisputeInfo";
import { getPeriodColors, getPeriodLabel } from "./PeriodBanner";

const fromLandscape = (min: number, max: number) => responsiveSize(min, max, BREAKPOINT_LANDSCAPE);

const StyledLink = styled(Link)<{ $hasLabel: boolean }>`
  display: block;
  margin-top: ${({ $hasLabel }) => ($hasLabel ? "12px" : "0")};
`;

const StyledListItem = styled(Card)<{ $accent: string }>`
  ${hoverShortTransitionTiming}
  position: relative;
  width: 100%;
  height: auto;
  border-left: 3px solid ${({ $accent }) => $accent};
  display: grid;
  grid-template-columns: minmax(0, 1fr) ${fromLandscape(180, 300)};
  align-items: center;
  gap: ${fromLandscape(20, 32)};
  padding: ${fromLandscape(16, 18)} ${fromLandscape(20, 24)};
`;

const CaseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const TitleLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
`;

const DisputeId = styled.span`
  flex-shrink: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  font-variant-numeric: tabular-nums;
`;

const Title = styled.h3`
  margin: 0;
  min-width: 0;
  font-size: ${fromLandscape(16, 18)};
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Phase = styled.span<{ $accent: string }>`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $accent }) => $accent};
  white-space: nowrap;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-size: ${fromLandscape(12, 13)};
  color: ${({ theme }) => theme.secondaryText};
  white-space: nowrap;

  a {
    flex-shrink: 0;
    font-size: inherit;
  }

  > * + *::before {
    content: "·";
    margin-right: 10px;
    color: ${({ theme }) => theme.stroke};
  }
`;

const MetaItem = styled.span`
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
`;

const Category = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Deadline = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-self: end;
  gap: 4px;
  padding-right: 8px;
  white-space: nowrap;
`;

const DeadlineLabel = styled.span`
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.secondaryText};
`;

const DeadlineValue = styled.span`
  font-size: ${fromLandscape(14, 16)};
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  font-variant-numeric: tabular-nums;
`;

const LabelContainer = styled.div`
  position: absolute;
  top: 0;
  right: 20px;
  transform: translateY(-50%);
`;

interface IDisputeListView {
  title: string;
  disputeID?: string;
  courtId?: string;
  court?: string;
  category?: string;
  rewards?: string;
  period?: Periods;
  date?: number;
  round?: number;
  isLoading?: boolean;
}

const DisputeListView: React.FC<IDisputeListView> = ({
  title,
  disputeID,
  courtId,
  court,
  category,
  rewards,
  period,
  date,
  round,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { isDisconnected } = useAccount();

  const accent = isUndefined(period) ? theme.stroke : getPeriodColors(period, theme)[0];
  const label =
    !isDisconnected && !isUndefined(disputeID) && !isUndefined(round) ? (
      <CardLabel disputeId={disputeID} round={round - 1} asPill />
    ) : null;

  return (
    <StyledLink to={`/cases/${disputeID?.toString()}`} $hasLabel={Boolean(label)}>
      <StyledListItem hover $accent={accent}>
        <CaseInfo>
          <TitleLine>
            <DisputeId>#{disputeID}</DisputeId>
            {isLoading ? <StyledSkeleton width={220} height={18} /> : <Title dir="auto">{title}</Title>}
            {!isUndefined(period) ? <Phase $accent={accent}>{getPeriodLabel(period, false, t)}</Phase> : null}
          </TitleLine>
          <Meta>
            {!isUndefined(court) && !isUndefined(courtId) ? (
              <InternalLink to={`/courts/${courtId}`} onClick={(event) => event.stopPropagation()}>
                {court}
              </InternalLink>
            ) : null}
            {!isUndefined(round) ? <MetaItem>{t("dispute_info.round_number", { round })}</MetaItem> : null}
            <Category>{category ?? t("dispute_info.general")}</Category>
            {!isUndefined(rewards) ? <MetaItem>{rewards}</MetaItem> : null}
          </Meta>
        </CaseInfo>

        {!isUndefined(period) && !isUndefined(date) ? (
          <Deadline>
            <DeadlineLabel>{getPeriodPhrase(period, t)}</DeadlineLabel>
            <DeadlineValue>{formatDate(date, false, i18n.language)}</DeadlineValue>
          </Deadline>
        ) : null}

        {label ? <LabelContainer>{label}</LabelContainer> : null}
      </StyledListItem>
    </StyledLink>
  );
};

export default DisputeListView;
