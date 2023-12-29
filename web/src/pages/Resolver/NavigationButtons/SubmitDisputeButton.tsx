import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";

const StyledButton = styled(Button)``;

const SubmitDisputeButton: React.FC = () => {
  return <StyledButton text="Submit the case"></StyledButton>;
};

export default SubmitDisputeButton;
