import React, { useMemo } from "react";
import styled from "styled-components";

import NewTabIcon from "svgs/icons/new-tab.svg";

import { DEFAULT_CHAIN, getChain } from "consts/chains";

import { ExternalLink } from "./ExternalLink";

const TxnLabel = styled.label<{ variant: string }>`
  display: flex;
  gap: 4px;
  color: ${({ theme, variant }) => (variant === "pending" ? theme.primaryBlue : theme[variant])};
  cursor: pointer;
  path {
    fill: ${({ theme, variant }) => (variant === "pending" ? theme.primaryBlue : theme[variant])};
  }
`;

interface ITxnHash {
  hash: `0x${string}`;
  variant: "success" | "error" | "pending";
}
const TxnHash: React.FC<ITxnHash> = ({ hash, variant }) => {
  const transactionExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/tx/${hash}`;
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
