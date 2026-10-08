import React, { useMemo } from "react";

import { Hash } from "viem";

import { cn } from "utils/cn";

import { getTxnExplorerLink } from "src/utils";

import { ExternalLink } from "./ExternalLink";
import NewTabIcon from "./StyledIcons/NewTabIcon";

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
      <label
        className={cn(
          "flex cursor-pointer gap-1 [&_path]:fill-current!",
          variant === "pending"
            ? "text-klerosUIComponentsPrimaryBlue"
            : variant === "success"
              ? "text-klerosUIComponentsSuccess"
              : "text-klerosUIComponentsError"
        )}
      >
        {" "}
        <span>{hash.substring(0, 6) + "..." + hash.substring(hash.length - 4)}</span>
        <NewTabIcon />
      </label>
    </ExternalLink>
  );
};

export default TxnHash;
