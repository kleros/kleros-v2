import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { IPFS_GATEWAY } from "consts/index";
import PolicyIcon from "svgs/icons/policy.svg";
import { isUndefined } from "utils/index";

const ShadeArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: calc(16px + (20 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875)
    calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
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

const LinkContainer = styled.div`
  display: flex;
  gap: calc(8px + (24 - 8) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

interface IPolicies {
  disputePolicyURI?: string;
  courtId?: string;
}

export const Policies: React.FC<IPolicies> = ({ disputePolicyURI, courtId }) => {
  return (
    <ShadeArea>
      <StyledP>Make sure you read and understand the Policies</StyledP>
      <LinkContainer>
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
