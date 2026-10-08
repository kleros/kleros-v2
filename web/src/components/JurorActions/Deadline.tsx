import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { useNow } from "hooks/useNow";
import { formatLocalDateTime, formatTimeLeft } from "utils/date";
import type { JurorActionKind } from "utils/jurorActions";

import { SrOnly } from "components/SrOnly";

const HOUR = 60 * 60;
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;

const Container = styled.div<{ $isUrgent: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.primaryText};

  > svg {
    flex-shrink: 0;
    width: 14px;
    height: 20px;
    fill: ${({ theme, $isUrgent }) => ($isUrgent ? theme.warning : theme.secondaryText)};
  }
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FirstLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
`;

const TimeLeft = styled.time`
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

const SecondLine = styled.span`
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.secondaryText};
`;

const UrgentLabel = styled.span`
  padding: 0 8px;
  border: 1px solid ${({ theme }) => theme.warning};
  border-radius: 300px;
  background-color: ${({ theme }) => theme.warningLight};
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
`;

interface IDeadline {
  deadline: number;
  isUrgent: boolean;
  /** Named in the hint once the deadline passed, like on the button: "You may still commit…". */
  kind: JurorActionKind;
}

/**
 * Time left, ticking every minute and every second in the last hour, above the exact local date.
 * Screen readers get the date only: the narrow units ("5h 12m") read badly.
 */
const Deadline: React.FC<IDeadline> = ({ deadline, isUrgent, kind }) => {
  const { t, i18n } = useTranslation();
  const minuteNow = useNow(MINUTE_MS);
  const isLastHour = deadline > minuteNow && deadline - minuteNow <= HOUR;
  const now = useNow(isLastHour ? SECOND_MS : MINUTE_MS);

  if (now >= deadline) {
    return (
      <Container $isUrgent>
        <HourglassIcon aria-hidden />
        <Lines>
          <span>{t("juror_actions.deadline_passed")}</span>
          <SecondLine>{t(`juror_actions.deadline_passed_hint_${kind}`)}</SecondLine>
        </Lines>
      </Container>
    );
  }

  const exactDate = formatLocalDateTime(deadline, i18n.language);
  return (
    <Container $isUrgent={isUrgent}>
      <HourglassIcon aria-hidden />
      <Lines>
        <FirstLine>
          <TimeLeft dateTime={new Date(deadline * 1000).toISOString()} aria-hidden>
            {t("juror_actions.ends_in", { time: formatTimeLeft(deadline - now, i18n.language) })}
          </TimeLeft>
          {isUrgent ? <UrgentLabel>{t("juror_actions.urgent")}</UrgentLabel> : null}
        </FirstLine>
        <SecondLine aria-hidden>{exactDate}</SecondLine>
        <SrOnly>{t("juror_actions.ends_on", { date: exactDate })}</SrOnly>
      </Lines>
    </Container>
  );
};

export default Deadline;
