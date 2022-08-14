import React from "react";
import styled from "styled-components";
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Community = () => (
  <Container>
    <h1>Community</h1>
    <StyledCard>
      <Section>
        {firstSection.map((element, i) => (
          <Element key={i} {...element} />
        ))}
      </Section>
      <StyledSeparator />
      <Section>
        {secondSection.map((element, i) => (
          <Element key={i} {...element} />
        ))}
      </Section>
    </StyledCard>
  </Container>
);

export default Community;
