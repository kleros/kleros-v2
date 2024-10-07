"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import RulerContextProvider from "context/RulerContext";

import { responsiveSize } from "styles/responsiveSize";

import ChangeDeveloper from "./ChangeDeveloper";
import ManualRuling from "./ManualRuling";
import RulingModes from "./RulingModes";
import SelectArbitrable from "./SelectArbitrable";
import ConnectWallet from "components/ConnectWallet";
import { useAccount } from "wagmi";
import { DEFAULT_CHAIN } from "consts/chains";

const Container = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin: 16px 32px;
  align-items: center;
  padding: ${responsiveSize(32, 72)} ${responsiveSize(16, 132)} ${responsiveSize(76, 96)};
`;

const StyledConnectWallet = styled(ConnectWallet)`
  align-self: flex-start;
`;

const Ruler: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);
  return (
    <RulerContextProvider>
      <Container>
        <h1>Ruler</h1>
        <SelectArbitrable />
        {isClient && (!isConnected || chainId !== DEFAULT_CHAIN) ? <StyledConnectWallet /> : null}
        <RulingModes />
        <ManualRuling />
        <ChangeDeveloper />
      </Container>
    </RulerContextProvider>
  );
};
export default Ruler;
