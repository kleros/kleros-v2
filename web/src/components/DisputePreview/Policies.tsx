import React from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";

import PaperclipIcon from "svgs/icons/paperclip.svg";
import PolicyIcon from "svgs/icons/policy.svg";

import { getIpfsUrl } from "utils/getIpfsUrl";
import { isUndefined } from "utils/index";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";

import { InternalLink } from "components/InternalLink";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 12px 16px 20px;
  background-color: ${({ theme }) => theme.mediumBlue};

  ${landscapeStyle(
    () => css`
      padding: 20px 32px;
    `
  )}
`;

const StyledP = styled.p`
  font-size: 14px;
  margin: 0;
  color: ${({ theme }) => theme.primaryBlue};
`;

const StyledPolicyIcon = styled(PolicyIcon)`
  width: 16px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledPaperclipIcon = styled(PaperclipIcon)`
  width: 16px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledInternalLink = styled(InternalLink)`
  ${hoverShortTransitionTiming}
  display: flex;
  gap: 4px;

  &:hover {
    svg {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

type Attachment = {
  label?: string;
  uri: string;
};
interface IPolicies {
  disputePolicyURI?: string;
  courtId?: string;
  attachment?: Attachment;
}

export const Policies: React.FC<IPolicies> = ({ disputePolicyURI, courtId, attachment }) => {
  const { id } = useParams();

  return (
    <Container>
      <StyledP>Policy documents:</StyledP>
      {!isUndefined(attachment) && !isUndefined(attachment.uri) ? (
        <StyledInternalLink
          to={`/attachment/?disputeId=${id}&title=${"Case Policy"}&url=${getIpfsUrl(attachment.uri)}`}
        >
          <StyledPaperclipIcon />
          {attachment.label ?? "Attachment"}
        </StyledInternalLink>
      ) : null}
      {isUndefined(disputePolicyURI) ? null : (
        <StyledInternalLink
          to={`/attachment/?disputeId=${id}&title=${"Dispute Policy"}&url=${getIpfsUrl(disputePolicyURI)}`}
        >
          <StyledPolicyIcon />
          Dispute Policy
        </StyledInternalLink>
      )}
      {isUndefined(courtId) ? null : (
        <StyledInternalLink to={`/courts/${courtId}/policy?section=description`}>
          <StyledPolicyIcon />
          Court Policy
        </StyledInternalLink>
      )}
    </Container>
  );
};
