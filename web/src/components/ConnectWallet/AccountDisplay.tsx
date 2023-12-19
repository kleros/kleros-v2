import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useAccount, useNetwork, useEnsAvatar, useEnsName } from "wagmi";
import Identicon from "react-identicons";
import { shortenAddress } from "utils/shortenAddress";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: auto;
  gap: 8px;
  align-items: center;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 0;

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
  padding-left: 0;
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
  svg {
    width: ${({ size }) => size + "px"};
    height: ${({ size }) => size + "px"};
  }
`;

const StyledAvatar = styled.img<{ size: `${number}` }>`
  object-fit: cover;
  border-radius: 50%;
  width: ${({ size }) => size + "px"};
  height: ${({ size }) => size + "px"};
`;

interface IIdenticonOrAvatar {
  size?: `${number}`;
  address?: `0x${string}`;
  avatar?: string;
}

export const IdenticonOrAvatar: React.FC<IIdenticonOrAvatar> = ({ size = "16", address, avatar }) => {
  return avatar ? (
    <StyledAvatar src={avatar} alt="avatar" size={size} />
  ) : (
    <StyledIdenticon size={size} string={address || ""} />
  );
};

interface IAddressOrName {
  address?: `0x${string}`;
  ensName?: string;
}

export const AddressOrName: React.FC<IAddressOrName> = ({ address, ensName }) => {
  return <label>{ensName ?? (address && shortenAddress(address))}</label>;
};

export const ChainDisplay: React.FC = () => {
  const { chain } = useNetwork();
  return <label>{chain?.name}</label>;
};

const AccountDisplay: React.FC = () => {
  const { address: defaultAddress } = useAccount();
  const { data: ensNameData } = useEnsName({ address: defaultAddress, chainId: 1 });
  const { data: avatarData } = useEnsAvatar({ name: ensNameData, chainId: 1 });

  const avatar = avatarData !== null ? avatarData : undefined;
  const ensName = ensNameData !== null ? ensNameData : undefined;

  return (
    <Container>
      <AccountContainer>
        <IdenticonOrAvatar size="32" address={defaultAddress} avatar={avatar} />
        <AddressOrName address={defaultAddress} ensName={ensName} />
      </AccountContainer>
      <ChainConnectionContainer>
        <ChainDisplay />
      </ChainConnectionContainer>
    </Container>
  );
};

export default AccountDisplay;
