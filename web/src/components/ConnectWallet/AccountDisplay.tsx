import React from "react";
import styled, { css } from "styled-components";

import Identicon from "react-identicons";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useChainId, useEnsAvatar, useEnsName } from "wagmi";

import { getChain } from "consts/chains";
import { shortenAddress } from "utils/shortenAddress";

import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: auto;
  gap: 8px;
  background-color: ${({ theme }) => theme.lightGrey};
  border-radius: 300px;
  padding: 0 12px;
  cursor: pointer;
  border: none;
  transition: background-color 0.1s;
  &:hover {
    background-color: ${({ theme }) => theme.stroke};
  }

  ${landscapeStyle(
    () => css`
      gap: 0px;
      background-color: ${({ theme }) => theme.whiteLowOpacitySubtle};
      &:hover {
        background-color: ${({ theme }) => theme.whiteLowOpacityStrong};
        label {
          color: ${({ theme }) => theme.white} !important;
          transition: color 0.2s;
        }
      }
    `
  )}
`;

const AccountContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
  width: fit-content;
  gap: 12px;

  > label {
    font-size: 14px;
    font-weight: 400;
  }

  ${landscapeStyle(
    () => css`
      > label {
        color: ${({ theme }) => theme.white}CC !important;
      }
    `
  )}
`;

const StyledIdenticon = styled(Identicon)<{ size: `${number}` }>`
  align-items: center;
  width: ${({ size }) => size + "px"} !important;
  height: ${({ size }) => size + "px"} !important;
`;

const StyledAvatar = styled.img<{ size: `${number}` }>`
  align-items: center;
  object-fit: cover;
  border-radius: 50%;
  width: ${({ size }) => size + "px"};
  height: ${({ size }) => size + "px"};
`;

const StyledSmallLabel = styled.label`
  font-size: 14px !important;
`;

interface IIdenticonOrAvatar {
  size?: `${number}`;
  address?: `0x${string}`;
}

export const IdenticonOrAvatar: React.FC<IIdenticonOrAvatar> = ({ size = "20", address: propAddress }) => {
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
  smallDisplay?: boolean;
}

export const AddressOrName: React.FC<IAddressOrName> = ({ address: propAddress, smallDisplay }) => {
  const { address: defaultAddress } = useAccount();
  const address = propAddress || defaultAddress;

  const { data } = useEnsName({
    address,
    chainId: 1,
  });

  const content = data ?? (isAddress(address!) ? shortenAddress(address) : address);

  return smallDisplay ? <StyledSmallLabel>{content}</StyledSmallLabel> : <label>{content}</label>;
};

export const ChainDisplay: React.FC = () => {
  const chainId = useChainId();
  const chain = getChain(chainId);
  return <label>{chain?.name}</label>;
};

const AccountDisplay: React.FC = () => {
  const { address } = useAccount();
  return (
    <Container aria-label={address}>
      <AccountContainer>
        <IdenticonOrAvatar size="20" />
        <AddressOrName />
      </AccountContainer>
    </Container>
  );
};

export default AccountDisplay;
