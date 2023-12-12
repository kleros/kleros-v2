import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  margin-top: ${responsiveSize(8, 24, 300)};
  margin-right: ${responsiveSize(8, 44, 300)};
  margin-left: ${responsiveSize(8, 44, 300)};
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
