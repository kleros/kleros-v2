import React from "react";
import styled from "styled-components";
import FormNotifs from "./FormNotifs";
import HeaderNotifs from "./HeaderNotifs";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const SendMeNotifications: React.FC = () => {
  return (
    <Container>
      <HeaderNotifs />
      <FormNotifs />
    </Container>
  );
};

export default SendMeNotifications;
