import React from "react";
import styled from "styled-components";
import CloseIcon from "svgs/icons/close.svg";
import SettingsIcon from "svgs/menu-icons/settings.svg";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
`;

const Title = styled.h3`
  margin: 0;
`;

const SVGContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  cursor: pointer;
  svg {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

interface IHeader {
  isSettings: boolean;
  openSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<IHeader> = ({ isSettings, openSettings }) => {
  const toggle = () => {
    openSettings((prev) => !prev);
  };
  return (
    <Container>
      {isSettings ? (
        <>
          <Title>Settings</Title>
          <SVGContainer onClick={toggle}>
            <CloseIcon />
          </SVGContainer>
        </>
      ) : (
        <>
          <Title>Swap</Title>
          <SVGContainer onClick={toggle}>
            <SettingsIcon />
          </SVGContainer>
        </>
      )}
    </Container>
  );
};

export default Header;
