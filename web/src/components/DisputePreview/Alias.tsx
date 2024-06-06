import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";
import { isAddress } from "viem";
import { useEnsAddress } from "wagmi";

import { Alias } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";

import { AddressOrName, IdenticonOrAvatar } from "../ConnectWallet/AccountDisplay";

const AliasContainer = styled.div`
  min-height: 32px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TextContainer = styled.div`
  display: flex;
  > label {
    color: ${({ theme }) => theme.primaryText};
    font-size: 14px;
  }
`;

interface IAlias {
  alias: Alias;
}

const AliasDisplay: React.FC<IAlias> = ({ alias }) => {
  const { data: addressFromENS, isLoading } = useEnsAddress({
    query: {
      // if alias.address is not an Address, we treat it as ENS and try to fetch address from there
      enabled: !isAddress(alias.address),
    },
    name: alias.address,
    chainId: 1,
  });

  // try fetching ens name, else go with address
  const address = addressFromENS ?? (alias.address as `0x${string}`);

  return (
    <AliasContainer>
      {isLoading ? <Skeleton width={30} height={24} /> : <IdenticonOrAvatar address={address} size="24" />}
      <TextContainer>
        {isLoading ? <Skeleton width={30} height={24} /> : <AddressOrName address={address} />}&nbsp;
        {!isUndefined(alias.name) && alias.name !== "" ? <label>({alias.name})</label> : null}
      </TextContainer>
    </AliasContainer>
  );
};

export default AliasDisplay;
