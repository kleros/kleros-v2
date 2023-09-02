import React from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { Card } from "@kleros/ui-components-library";
import { Element } from "./Element";
import { firstSection, secondSection } from "consts/community-elements";

const Container = styled.div`
  margin-top: 64px;
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
  height: 64px;
  padding: 0 32px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  ${smallScreenStyle(
    () => css`
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      height: auto;
    `
  )}
`;

const TwoElementContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;

  ${smallScreenStyle(
    () => css`
      flex-direction: column;
      gap: 8px;
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
