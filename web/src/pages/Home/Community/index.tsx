import React from "react";
import styled, { css } from "styled-components";

import { Card } from "@kleros/ui-components-library";

import { section } from "consts/community-elements";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { Element } from "./Element";

const Container = styled.div`
  margin-top: ${responsiveSize(28, 48)};

  h1 {
    margin-bottom: ${responsiveSize(12, 24)};
    font-size: ${responsiveSize(20, 24)};
  }
`;

const StyledCard = styled(Card)`
  display: flex;
  width: 100%;
  height: auto;
  gap: 12px;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 16px;
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
          <Element key={element.title} {...element} />
        ))}
      </ThreeElementContainer>
      <Element {...section[3]} />
    </StyledCard>
  </Container>
);

export default Community;
