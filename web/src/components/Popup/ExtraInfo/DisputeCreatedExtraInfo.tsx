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

const DisputeCreatedExtraInfo: React.FC = () => {
  return (
    <Container>
      {
        "In order to better track the case progress, we recommend you to subscribe to notifications: Settings > Notifications"
      }
    </Container>
  );
};
export default DisputeCreatedExtraInfo;
