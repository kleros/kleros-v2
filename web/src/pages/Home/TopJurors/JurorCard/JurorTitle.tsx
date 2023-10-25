import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";

const Container = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;

  ${landscapeStyle(
    () => css`
      width: calc(40px + (220 - 40) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      gap: 36px;
    `
  )}
`;

const LogoAndAddress = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

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
      <LogoAndAddress>
        <IdenticonOrAvatar address={address} />
        <AddressOrName address={address} />
      </LogoAndAddress>
    </Container>
  );
};
export default JurorTitle;
