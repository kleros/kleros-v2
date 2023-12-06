import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  ${responsiveSize("marginLeft", 8, 44, 300)}
  ${responsiveSize("marginRight", 8, 44, 300)}
  ${responsiveSize("marginTop", 8, 24, 300)}
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
