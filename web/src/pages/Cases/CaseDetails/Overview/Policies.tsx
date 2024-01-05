import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { IPFS_GATEWAY } from "consts/index";
import PolicyIcon from "svgs/icons/policy.svg";
import { isUndefined } from "utils/index";
import { responsiveSize } from "styles/responsiveSize";
import PaperclipIcon from "svgs/icons/paperclip.svg";

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

const StyledA = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
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
          <StyledA href={`${IPFS_GATEWAY}${attachment.uri}`} target="_blank" rel="noreferrer">
            <StyledPaperclipIcon />
            {attachment.label ?? "Attachment"}
          </StyledA>
        ) : null}
        {isUndefined(disputePolicyURI) ? null : (
          <StyledA href={`${IPFS_GATEWAY}${disputePolicyURI}`} target="_blank" rel="noreferrer">
            <StyledPolicyIcon />
            Dispute Policy
          </StyledA>
        )}
        {isUndefined(courtId) ? null : (
          <StyledA href={`#/courts/${courtId}/purpose?section=description`}>
            <StyledPolicyIcon />
            Court Policy
          </StyledA>
        )}
      </LinkContainer>
    </ShadeArea>
  );
};
