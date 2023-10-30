import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
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

  ${landscapeStyle(
    () => css`
      width: calc(40px + (220 - 40) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
    `
  )}
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
