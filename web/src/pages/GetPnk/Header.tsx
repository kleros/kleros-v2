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
  toggleSettings: () => void;
}

const Header: React.FC<IHeader> = ({ isSettings, toggleSettings }) => {
  return (
    <Container>
      {isSettings ? (
        <>
          <Title>Settings</Title>
          <SVGContainer onClick={toggleSettings}>
            <CloseIcon />
          </SVGContainer>
        </>
      ) : (
        <>
          <Title>Swap</Title>
          <SVGContainer onClick={toggleSettings}>
            <SettingsIcon />
          </SVGContainer>
        </>
      )}
    </Container>
  );
};

export default Header;
