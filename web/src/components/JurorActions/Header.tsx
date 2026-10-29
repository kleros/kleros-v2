import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import BallotIcon from "svgs/icons/voted-ballot.svg";

import type { JurorAction } from "utils/jurorActions";

import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  > svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const Heading = styled.h2`
  margin: 0;
  font-size: ${responsiveSize(16, 18)};
  font-weight: 600;
  line-height: 24px;
  color: ${({ theme }) => theme.primaryText};
`;

const Count = styled.span`
  min-width: 24px;
  padding: 0 8px;
  border-radius: 300px;
  background-color: ${({ theme }) => theme.mediumBlue};
  color: ${({ theme }) => theme.primaryBlue};
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  font-variant-numeric: tabular-nums;
`;

export const IconButton = styled.button`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  padding: 0;
  border: none;
  border-radius: 3px;
  background: none;
  cursor: pointer;

  svg {
    width: 12px;
    height: 12px;
    fill: ${({ theme }) => theme.secondaryText};
  }

  &:hover svg {
    fill: ${({ theme }) => theme.primaryText};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primaryBlue};
  }
`;

interface IHeader {
  headingAs: "h1" | "h2";
  headingId: string;
  headingRef?: React.Ref<HTMLHeadingElement>;
  /** All of them, including the ones just sent. */
  actions: readonly JurorAction[];
  /** Dismiss or close button. */
  children?: React.ReactNode;
}

/** "Needs your vote" and the count of actions due, the same count as the header indicator. */
const Header: React.FC<IHeader> = ({ headingAs, headingId, headingRef, actions, children }) => {
  const { t } = useTranslation();
  const dueCount = actions.filter(({ isSubmitted }) => !isSubmitted).length;
  // Once everything left was just sent, saying it needs a vote would contradict the rows.
  const title =
    dueCount === 0 && actions.length > 0
      ? t("juror_actions.title_confirming", { count: actions.length })
      : t("juror_actions.title");

  return (
    <Container>
      <BallotIcon aria-hidden />
      <Heading as={headingAs} id={headingId} ref={headingRef} tabIndex={-1}>
        {title}
      </Heading>
      {/* Hidden from screen readers: the list and the header indicator already give the count. */}
      {dueCount > 0 ? <Count aria-hidden>{dueCount}</Count> : null}
      {children}
    </Container>
  );
};

export default Header;
