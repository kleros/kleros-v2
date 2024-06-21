import React from "react";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

const StyledButton = styled(Button)<{ prevRoute: string }>`
  display: ${({ prevRoute }) => (prevRoute === "" ? "none" : "flex")};
`;

interface IReturnButton {
  prevRoute: string;
}

const ReturnButton: React.FC<IReturnButton> = ({ prevRoute }) => {
  const navigate = useNavigate();

  return (
    <StyledButton
      prevRoute={prevRoute}
      onClick={() => navigate(prevRoute)}
      text="Return"
      variant="secondary"
    ></StyledButton>
  );
};

export default ReturnButton;
