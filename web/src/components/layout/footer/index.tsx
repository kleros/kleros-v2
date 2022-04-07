import React from "react";
import styled from "styled-components";
import SecuredByKleros from "./SecuredByKleros";
import SocialMedia from "./SocialMedia";

const Container = styled.div`
  height: 80px;
  width: 100vw;
  background-color: ${({ theme }) => theme.primaryPurple};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Footer: React.FC = () => (
  <Container>
    <SecuredByKleros />
    <SocialMedia />
  </Container>
);

export default Footer;
