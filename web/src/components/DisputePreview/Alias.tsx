import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";
import { isAddress } from "viem";
import { useEnsAddress } from "wagmi";

import { AddressOrName, IdenticonOrAvatar } from "../ConnectWallet/AccountDisplay";

const AliasContainer = styled.div`
  min-height: 32px;
  display: flex;
  gap: 8px;
  align-items: center;
  max-width: 100%;
`;

const TextContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  > label {
    color: ${({ theme }) => theme.primaryText};
    font-size: 14px;
    word-wrap: break-word;
    max-width: 100%;
  }
`;

interface IAlias {
  name: string;
  address: `0x${string}`;
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
  const resolvedAddress = addressFromENS ?? (address as `0x${string}`);

  return (
    <AliasContainer>
      {isLoading ? <Skeleton width={30} height={24} /> : <IdenticonOrAvatar address={resolvedAddress} size="24" />}
      <TextContainer>
        {isLoading ? <Skeleton width={30} height={24} /> : <AddressOrName address={resolvedAddress} />}&nbsp;
        <label>({name})</label>
      </TextContainer>
    </AliasContainer>
  );
};

export default AliasDisplay;
