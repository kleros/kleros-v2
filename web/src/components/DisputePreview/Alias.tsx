import React from "react";

import Skeleton from "react-loading-skeleton";
import { Address, isAddress } from "viem";
import { useEnsAddress } from "wagmi";

import { cn } from "utils/cn";

import { AddressOrName, IdenticonOrAvatar } from "../ConnectWallet/AccountDisplay";

interface IAlias {
  name: string;
  address: string;
}

const AliasDisplay: React.FC<IAlias> = ({ name, address }) => {
  const { data: addressFromENS, isLoading } = useEnsAddress({
    query: {
      // if alias.address is not an Address, we treat it as ENS and try to fetch address from there
      enabled: !isAddress(address),
    },
    name: address,
    chainId: 1,
  });

  // try fetching ens name, else go with address
  const resolvedAddress = addressFromENS ?? (address as Address);

  return (
    <div dir="auto" className="min-h-[32px] flex gap-2 items-center max-w-full">
      {isLoading ? <Skeleton width={30} height={24} /> : <IdenticonOrAvatar address={resolvedAddress} size="24" />}
      <div
        className={cn(
          "flex flex-wrap items-center max-w-full [&>label]:text-klerosUIComponentsPrimaryText",
          "[&>label]:text-[14px] [&>label]:[word-wrap:break-word] [&>label]:max-w-full"
        )}
      >
        {isLoading ? <Skeleton width={30} height={24} /> : <AddressOrName address={resolvedAddress} />}&nbsp;
        <label>({name})</label>
      </div>
    </div>
  );
};

export default AliasDisplay;
