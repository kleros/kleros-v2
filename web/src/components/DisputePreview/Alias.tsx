import React from "react";
import styled from "styled-components";
import { AddressOrName, IdenticonOrAvatar } from "../ConnectWallet/AccountDisplay";
import { Alias } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";
import { useEnsAddress } from "wagmi";
import { isAddress } from "viem";
import Skeleton from "react-loading-skeleton";

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
    enabled: !isAddress(alias.address), // if alias.address is not an Address, we treat it as ENS and try to fetch address from there
    name: alias.address,
    chainId: 1,
  });

  // try fetching ens name, else go with address
  const address = addressFromENS ?? alias.address;

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
