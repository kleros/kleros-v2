import React from "react";
import styled, { css } from "styled-components";
import { BREAKPOINT_TABLET_SCREEN, smallScreenStyle } from "styles/smallScreenStyle";
import { useAccount, useNetwork, useEnsAvatar, useEnsName } from "wagmi";
import Identicon from "react-identicons";
import { shortenAddress } from "utils/shortenAddress";
import { useWindowWidth } from "~src/hooks/useWindowWidth";
const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  align-items: center;
  border-radius: 300px;
  background-color: ${({ theme }) => theme.whiteLowOpacity};
  padding: 0 12px;

  ${smallScreenStyle(
    () => css`
      background-color: ${({ theme }) => theme.whiteBackground};
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 0px;
      height: auto;
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
    color: ${({ theme }) => theme.primaryText};
    font-size: 14px;
  }

  ${smallScreenStyle(
    () => css`
      gap: 8px;
      > label {
        font-size: 16px;
        font-weight: 600;
      }
    `
  )}
`;
const ChainConnectionContainer = styled.div`
  width: fit-content;
  min-height: 32px;
  display: flex;
  align-items: center;
  padding-left: 12px;
  > label {
    color: ${({ theme }) => theme.success};
    font-size: 14px;
    font-weight: 500;
  }

  :before {
    content: "";
    width: 8px;
    height: 8px;
    margin: 0px 8px 0px 3px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.success};
  }

  ${smallScreenStyle(
    () => css`
      padding-left: 0px;

      > label {
        font-size: 16px;
      }

      :before {
        margin: 0px 13px 0px 3px;
      }
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

export const IdenticonOrAvatar: React.FC<{ size: `${number}` }> = ({ size } = { size: "16" }) => {
  const { address } = useAccount();
  const { data: name } = useEnsName({
    address,
    chainId: 1,
  });
  const { data: avatar } = useEnsAvatar({
    name,
    chainId: 1,
  });
  return avatar ? (
    <StyledAvatar src={avatar} alt="avatar" size={size} />
  ) : (
    <StyledIdenticon size={size} string={address} />
  );
};

export const AddressOrName: React.FC = () => {
  const { address } = useAccount();
  const { data } = useEnsName({
    address,
    chainId: 1,
  });
  return <label>{data ?? (address && shortenAddress(address))}</label>;
};

export const ChainDisplay: React.FC = () => {
  const { chain } = useNetwork();
  return <label>{chain?.name}</label>;
};

const AccountDisplay: React.FC = () => {
  const windowWidth = useWindowWidth();

  const screenIsBig = windowWidth > BREAKPOINT_TABLET_SCREEN;

  return (
    <Container>
      <AccountContainer>
        <IdenticonOrAvatar size="32" />
        <AddressOrName />
      </AccountContainer>
      {screenIsBig && (
        <ChainConnectionContainer>
          <ChainDisplay />
        </ChainConnectionContainer>
      )}
    </Container>
  );
};

export default AccountDisplay;
