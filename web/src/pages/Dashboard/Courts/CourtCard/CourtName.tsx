import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import LightButton from "components/LightButton";

import ArrowIcon from "svgs/icons/arrow.svg";
import { useNavigateAndScrollTop } from "hooks/useNavigateAndScrollTop";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 16px;
  align-items: center;

  small {
    height: 100%;
    font-weight: 600;
  }

  ${landscapeStyle(
    () =>
      css`
        justify-content: flex-start;
        width: auto;
      `
  )}
`;

const StyledButton = styled(LightButton)`
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  padding: 0px;
  > .button-text {
    color: ${({ theme }) => theme.primaryBlue};
    font-size: 14px;
  }
`;

interface ICourtName {
  name: string;
  id: string;
}

const CourtName: React.FC<ICourtName> = ({ name, id }) => {
  const navigate = useNavigateAndScrollTop();

  return (
    <Container>
      <small>{name}</small>
      <StyledButton
        onClick={() => navigate(`/courts/${id?.toString()}`)}
        text="Open Court"
        Icon={ArrowIcon}
        className="reverse-button"
      />
    </Container>
  );
};
export default CourtName;
