import React from "react";
import styled from "styled-components";

import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import Arrow from "svgs/icons/arrow-left.svg";
import PaperClip from "svgs/icons/paperclip.svg";

import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 38px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h1`
  margin: 0px;
  font-size: ${responsiveSize(20, 24)};
`;

const StyledPaperClip = styled(PaperClip)`
  width: ${responsiveSize(16, 24)};
  height: ${responsiveSize(16, 24)};
  path {
    fill: ${({ theme }) => theme.secondaryPurple}B0;
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
    .button-svg {
      path {
        fill: ${({ theme }) => theme.secondaryBlue};
      }
    }
    .button-text {
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const Header: React.FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const disputeId = searchParams.get("disputeId");

  const handleReturn = () => {
    navigate(`/cases/${disputeId}/evidence`);
  };

  return (
    <Container>
      <TitleContainer>
        <StyledPaperClip />
        <Title>{title}</Title>
      </TitleContainer>
      <StyledButton text="Return" Icon={Arrow} onClick={handleReturn} />
    </Container>
  );
};

export default Header;
