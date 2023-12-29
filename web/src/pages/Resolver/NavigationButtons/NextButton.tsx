import React from "react";
import { Button } from "@kleros/ui-components-library";
import { useNavigate } from "react-router-dom";

interface INextButton {
  nextRoute: string;
}

const NextButton: React.FC<INextButton> = ({ nextRoute }) => {
  const navigate = useNavigate();

  return <Button disabled={false} onClick={() => navigate(nextRoute)} text="Next" />;
};

export default NextButton;
