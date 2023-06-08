import React from "react";
import styled from "styled-components";
import FormNotifs from "./FormNotifs";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 32px;
  margin-bottom: 12px;
`;

const HeaderNotifs: React.FC = () => {
  return <HeaderContainer>Send Me Notifications</HeaderContainer>;
};

const SendMeNotifications: React.FC = () => {
  return (
    <Container>
      <HeaderNotifs />
      <FormNotifs />
    </Container>
  );
};

export default SendMeNotifications;
