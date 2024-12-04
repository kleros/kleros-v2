import React from "react";
import styled, { css } from "styled-components";

import PaperclipIcon from "svgs/icons/paperclip.svg";
import PolicyIcon from "svgs/icons/policy.svg";

import { getIpfsUrl } from "utils/getIpfsUrl";
import { isUndefined } from "utils/index";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { InternalLink } from "components/InternalLink";

const ShadeArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: ${responsiveSize(16, 20)} ${responsiveSize(16, 32)};
  margin-top: 16px;
  background-color: ${({ theme }) => theme.mediumBlue};

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
    `
  )};
`;

const StyledP = styled.p`
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.primaryBlue};
  ${landscapeStyle(
    () => css`
      margin-bottom: 0;
    `
  )};
`;

const StyledPolicyIcon = styled(PolicyIcon)`
  width: 16px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledPaperclipIcon = styled(PaperclipIcon)`
  width: 16px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const LinkContainer = styled.div`
  display: flex;
  gap: ${responsiveSize(16, 24)};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledInternalLink = styled(InternalLink)`
  display: flex;
  gap: 4px;

  &:hover {
    svg {
      transition: fill 0.1s;
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
  return (
    <ShadeArea>
      <StyledP>Make sure you read and understand the Policies</StyledP>
      <LinkContainer>
        {!isUndefined(attachment) && !isUndefined(attachment.uri) ? (
          <StyledInternalLink to={`attachment/?url=${getIpfsUrl(attachment.uri)}`}>
            <StyledPaperclipIcon />
            {attachment.label ?? "Attachment"}
          </StyledInternalLink>
        ) : null}
        {isUndefined(disputePolicyURI) ? null : (
          <StyledInternalLink to={`policy/attachment/?url=${getIpfsUrl(disputePolicyURI)}`}>
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
      </LinkContainer>
    </ShadeArea>
  );
};
