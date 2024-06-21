import React from "react";
import styled, { css } from "styled-components";

import Identicon from "react-identicons";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useChainId, useEnsAvatar, useEnsName } from "wagmi";

import { getChain } from "consts/chains";
import { shortenAddress } from "utils/shortenAddress";

import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: auto;
  align-items: flex-start;
  gap: 8px;
  align-items: center;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 0px;

  ${landscapeStyle(
    () => css`
      background-color: ${({ theme }) => theme.whiteLowOpacity};
      flex-direction: row;
      align-content: center;
      border-radius: 300px;
      gap: 0px;
      padding: 0 12px;
    `
  )}
`;

const AccountContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
  width: fit-content;
  gap: 8px;

  > label {
    font-size: 16px;
    font-weight: 600;
  }

  ${landscapeStyle(
    () => css`
      gap: 12px;
      > label {
        color: ${({ theme }) => theme.primaryText};
        font-weight: 400;
        font-size: 14px;
      }
    `
  )}
`;
const ChainConnectionContainer = styled.div`
  display: flex;
  width: fit-content;
  min-height: 32px;
  align-items: center;
  padding-left: 0px;
  > label {
    color: ${({ theme }) => theme.success};
    font-size: 16px;

    font-weight: 500;
  }

  :before {
    content: "";
    width: 8px;
    height: 8px;
    margin: 0px 13px 0px 3px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.success};
  }

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const StyledIdenticon = styled(Identicon)<{ size: `${number}` }>`
  align-items: center;
  svg {
    width: ${({ size }) => size + "px"};
    height: ${({ size }) => size + "px"};
  }
`;

const StyledAvatar = styled.img<{ size: `${number}` }>`
  align-items: center;
  object-fit: cover;
  border-radius: 50%;
  width: ${({ size }) => size + "px"};
  height: ${({ size }) => size + "px"};
`;

interface IIdenticonOrAvatar {
  size?: `${number}`;
  address?: `0x${string}`;
}

export const IdenticonOrAvatar: React.FC<IIdenticonOrAvatar> = ({ size = "16", address: propAddress }) => {
  const { address: defaultAddress } = useAccount();
  const address = propAddress || defaultAddress;

  const { data: name } = useEnsName({
    address,
    chainId: 1,
  });
  const { data: avatar } = useEnsAvatar({
    name: normalize(name ?? ""),
    chainId: 1,
  });

  return avatar ? (
    <StyledAvatar src={avatar} alt="avatar" size={size} />
  ) : (
    <StyledIdenticon size={size} string={address} />
  );
};

interface IAddressOrName {
  address?: `0x${string}`;
}

export const AddressOrName: React.FC<IAddressOrName> = ({ address: propAddress }) => {
  const { address: defaultAddress } = useAccount();
  const address = propAddress || defaultAddress;

  const { data } = useEnsName({
    address,
    chainId: 1,
  });

  return <label>{data ?? (isAddress(address!) ? shortenAddress(address) : address)}</label>;
};

export const ChainDisplay: React.FC = () => {
  const chainId = useChainId();
  const chain = getChain(chainId);
  return <label>{chain?.name}</label>;
};

const AccountDisplay: React.FC = () => {
  return (
    <Container>
      <AccountContainer>
        <IdenticonOrAvatar size="32" />
        <AddressOrName />
      </AccountContainer>
      <ChainConnectionContainer>
        <ChainDisplay />
      </ChainConnectionContainer>
    </Container>
  );
};

export default AccountDisplay;
