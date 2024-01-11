import React from "react";
import styled from "styled-components";
import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";

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

interface IJurorTitle {
  address: string;
}

const JurorTitle: React.FC<IJurorTitle> = ({ address }) => {
  return (
    <Container>
      <IdenticonOrAvatar address={address} />
      <AddressOrName address={address} />
    </Container>
  );
};
export default JurorTitle;
