import React from "react";
import styled from "styled-components";
import OptionCard from "../OptionCard";

const Options: React.FC = () => {
  return (
    <Container>
      <label> Which option do you want to fund? </label>
      <OptionsContainer>
        <OptionCard text="hey" funding="100" required="1000" />
        <OptionCard text="hey" funding="100" required="1000" />
        <OptionCard text="hey" funding="100" required="1000" />
        <OptionCard text="hey" funding="100" required="1000" />
      </OptionsContainer>
    </Container>
  );
};

const Container = styled.div`
  margin: 24px 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

export default Options;
