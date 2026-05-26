import React, { useMemo } from "react";
import styled, { DefaultTheme } from "styled-components";

import { Hash } from "viem";

import NewTabIcon from "svgs/icons/new-tab.svg";

import { getTxnExplorerLink } from "src/utils";

import { ExternalLink } from "./ExternalLink";

const TxnLabel = styled.label<{ variant: string }>`
  display: flex;
  gap: 4px;
  color: ${({ theme, variant }) => (variant === "pending" ? theme.primaryBlue : theme[variant as keyof DefaultTheme])};
  cursor: pointer;
  path {
    fill: ${({ theme, variant }) => (variant === "pending" ? theme.primaryBlue : theme[variant as keyof DefaultTheme])};
  }
`;

interface ITxnHash {
  hash: Hash;
  variant: "success" | "error" | "pending";
}
const TxnHash: React.FC<ITxnHash> = ({ hash, variant }) => {
  const transactionExplorerLink = useMemo(() => {
    return getTxnExplorerLink(hash);
  }, [hash]);

  return (
    <ExternalLink to={transactionExplorerLink} rel="noopener noreferrer" target="_blank">
      <TxnLabel {...{ variant }}>
        {" "}
        <span>{hash.substring(0, 6) + "..." + hash.substring(hash.length - 4)}</span>
        <NewTabIcon />
      </TxnLabel>
    </ExternalLink>
  );
};

export default TxnHash;
