import React from "react";
import styled from "styled-components";

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

export default HeaderNotifs;
