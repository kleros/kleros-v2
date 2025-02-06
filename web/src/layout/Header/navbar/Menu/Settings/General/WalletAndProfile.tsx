import React from "react";
import styled from "styled-components";

import { hoverLongTransitionTiming } from "styles/commonStyles";

import ArrowIcon from "svgs/icons/arrow.svg";

import { AddressOrName, IdenticonOrAvatar } from "components/ConnectWallet/AccountDisplay";
import { StyledArrowLink } from "components/StyledArrowLink";
import { ISettings } from "../../../index";

const Container = styled.div`
  ${hoverLongTransitionTiming}
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 32px;
  gap: 24px;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 30px;

  > label {
    color: ${({ theme }) => theme.primaryText};
    font-size: 16px;
    font-weight: 600;
  }

  :hover {
    background-color: ${({ theme }) => theme.lightBlue};
  }
`;

const AvatarAndAddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const ReStyledArrowLink = styled(StyledArrowLink)`
  font-size: 14px;

  > svg {
    height: 14px;
    width: 14px;
  }
`;

const WalletAndProfile: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  return (
    <Container>
      <AvatarAndAddressContainer>
        <IdenticonOrAvatar />
        <AddressOrName />
      </AvatarAndAddressContainer>
      <ReStyledArrowLink to={"/profile/1/desc/all"} onClick={toggleIsSettingsOpen}>
        My Profile <ArrowIcon />
      </ReStyledArrowLink>
    </Container>
  );
};
export default WalletAndProfile;
