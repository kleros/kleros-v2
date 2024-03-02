import React, { useState } from "react";
import styled from "styled-components";
import FromCard from "./Cards/FromCard";
import ToCard from "./Cards/ToCard";
import Popup, { PopupType } from "components/Popup";
import { isProductionDeployment } from "consts/index";
import SwapButton from "./SwapButton";
import Routes from "./Cards/Routes";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content;
  gap: 16px;
`;

const Swap: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <Container>
      <FromCard />
      <ToCard />
      <Routes />
      <SwapButton />
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
