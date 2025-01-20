import React from "react";
import styled from "styled-components";

import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";
import { InternalLink } from "components/InternalLink";

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  label {
    font-size: 16px;
  }

  canvas {
    width: 20px;
    height: 20px;
    border-radius: 10%;
  }
`;

const StyledInternalLink = styled(InternalLink)`
  :hover {
    label {
      cursor: pointer;
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

interface IJurorTitle {
  address: string;
}

const JurorTitle: React.FC<IJurorTitle> = ({ address }) => {
  const profileLink = `/profile/1/desc/all?address=${address}`;

  return (
    <Container>
      <IdenticonOrAvatar address={address} />
      <StyledInternalLink to={profileLink}>
        <AddressOrName address={address} />
      </StyledInternalLink>
    </Container>
  );
};
export default JurorTitle;
