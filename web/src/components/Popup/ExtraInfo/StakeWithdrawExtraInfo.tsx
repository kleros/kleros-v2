import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  margin-left: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-right: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-top: calc(8px + (24 - 8) * ((100vw - 300px) / (1250 - 300)));
`;

const StakeWithdrawExtraInfo: React.FC = () => {
  return (
    <Container>
      {
        "In order not to miss when you're drawn for cases, make sure to subscribe to notifications: Settings > Notifications"
      }
    </Container>
  );
};
export default StakeWithdrawExtraInfo;
