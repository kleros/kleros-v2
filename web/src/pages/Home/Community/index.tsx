import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card } from "@kleros/ui-components-library";
import { Element } from "./Element";
import { section } from "consts/community-elements";

const Container = styled.div`
  margin-top: calc(44px + (64 - 44) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  h1 {
    margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  }
`;

const StyledCard = styled(Card)`
  display: flex;
  width: 100%;
  height: auto;
  gap: 12px;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 24px;
  align-items: flex-start;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
      gap: 20px;
      padding: 24px 32px;
    `
  )}
`;

const ThreeElementContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
      gap: 48px;
    `
  )}
`;

const Community = () => (
  <Container>
    <h1>Community</h1>
    <StyledCard>
      <ThreeElementContainer>
        {section.slice(0, 3).map((element) => (
          <Element key={element.Icon} {...element} />
        ))}
      </ThreeElementContainer>
      <Element {...section[3]} />
    </StyledCard>
  </Container>
);

export default Community;
