import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card } from "@kleros/ui-components-library";
import { Element } from "./Element";
import { firstSection, secondSection } from "consts/community-elements";

const Container = styled.div`
  margin-top: 64px;

  h1 {
    margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
`;

const StyledSeparator = styled.hr`
  margin: 0;
`;

const Section = styled.div`
  width: 100%;
  gap: 8px;
  flex-direction: column;
  height: auto;
  flex-wrap: wrap;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
      gap: 0px;
      padding: 0 32px;
      min-height: 64px;
    `
  )}
`;

const TwoElementContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: 48px;
    `
  )}
`;

const Community = () => (
  <Container>
    <h1>Community</h1>
    <StyledCard>
      <Section>
        <TwoElementContainer>
          {firstSection.slice(0, 2).map((element) => (
            <Element key={element.primaryText} {...element} />
          ))}
        </TwoElementContainer>
        <Element {...firstSection[2]} />
      </Section>
      <StyledSeparator />
      <Section>
        {secondSection.map((element) => (
          <Element key={element.primaryText} {...element} />
        ))}
      </Section>
    </StyledCard>
  </Container>
);

export default Community;
