"use client";
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  margin: 16px 32px;
  align-items: center;
`;
const Arbitrables = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
`;

const SettingsPane = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
`;

const Home: React.FC = () => {
  return <Container></Container>;
};
export default Home;
