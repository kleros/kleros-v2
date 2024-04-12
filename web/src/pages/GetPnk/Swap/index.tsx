import React, { useState } from "react";
import styled from "styled-components";
import FromCard from "./Cards/FromCard";
import ToCard from "./Cards/ToCard";
import { EnsureChain } from "components/EnsureChain";
import SwapDetails from "./Cards/SwapDetails";
import { Button } from "@kleros/ui-components-library";
import Popup, { PopupType } from "components/Popup";
import { isProductionDeployment } from "consts/index";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content;
  gap: 16px;
`;

const StyledEnsureChain = styled(EnsureChain)`
  width: 100%;
`;

const StyledButton = styled(Button)`
  width: 100%;
`;
const Swap: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  return (
    <Container>
      <FromCard />
      <ToCard />
      <StyledEnsureChain>
        <>
          <SwapDetails />
          <StyledButton text="Swap" onClick={() => setIsPopupOpen(true)} disabled={!isProductionDeployment()} />
        </>
      </StyledEnsureChain>
      {isPopupOpen && (
        <Popup
          title="Success!"
          popupType={PopupType.SWAP_SUCCESS}
          hash="0xx"
          amount="1000 PNK"
          setIsOpen={setIsPopupOpen}
        />
      )}
    </Container>
  );
};

export default Swap;
