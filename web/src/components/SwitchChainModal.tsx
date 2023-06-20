import React, { useRef } from "react";
import styled from "styled-components";
import { useFocusOutside } from "hooks/useFocusOutside";
import { Overlay } from "components/Overlay";
import { useSwitchNetwork } from "wagmi";
import { Button } from "@kleros/ui-components-library";
import { SUPPORTED_CHAINS } from "consts/chains";

const Container = styled.div`
  display: flex;
  position: absolute;
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  overflow-y: auto;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  width: calc(300px + (424 - 300) * ((100vw - 300px) / (1250 - 300)));
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  font-size: 24px;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 24px;
`;

const StyledButton = styled(Button)`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  width: fit-content;
  height: 36px;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 24px;
`;

interface IChainButton {
  chainId: number;
}

export const ChainButton: React.FC<IChainButton> = ({ chainId }) => {
  const { switchNetwork, isLoading } = useSwitchNetwork();
  const handleSwitch = () => {
    if (!switchNetwork) {
      console.error("Cannot switch network. Please do it manually.");
      return;
    }
    try {
      switchNetwork(chainId);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <StyledButton
      isLoading={isLoading}
      disabled={isLoading}
      text={`${SUPPORTED_CHAINS[chainId].chainName}`}
      onClick={handleSwitch}
    />
  );
};

interface ISwitchChainModal {
  toggle: () => void;
}

const SwitchChainModal: React.FC<ISwitchChainModal> = ({ toggle }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => {
    toggle();
  });

  return (
    <>
      <Overlay />
      <Container ref={containerRef}>
        <HeaderContainer>Switch to</HeaderContainer>
        <BodyContainer>
          {Object.keys(SUPPORTED_CHAINS).map((chainId) => (
            <ChainButton key={chainId} chainId={Number(chainId)} />
          ))}
        </BodyContainer>
      </Container>
    </>
  );
};

export default SwitchChainModal;
