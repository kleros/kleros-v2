import React from "react";
import styled from "styled-components";

import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import Arrow from "svgs/icons/arrow-left.svg";
import PaperClip from "svgs/icons/paperclip.svg";

import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h1`
  margin: 0px;
  font-size: ${responsiveSize(16, 24)};
`;

const StyledPaperClip = styled(PaperClip)`
  width: ${responsiveSize(16, 24)};
  height: ${responsiveSize(16, 24)};
  path {
    fill: ${({ theme }) => theme.primaryPurple};
  }
`;

const StyledButton = styled(Button)`
  background-color: transparent;
  padding: 0;
  .button-text {
    color: ${({ theme }) => theme.primaryBlue};
    font-weight: 400;
  }
  .button-svg {
    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }
  :focus,
  :hover {
    background-color: transparent;
  }
`;

const Header: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Container>
      <TitleContainer>
        <StyledPaperClip />
        <Title>Attachment File</Title>{" "}
      </TitleContainer>
      <StyledButton text="Return" Icon={Arrow} onClick={() => navigate(`/cases/${id}/evidence`)} />
    </Container>
  );
};

export default Header;
