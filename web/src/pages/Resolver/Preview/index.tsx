import React from "react";
import styled from "styled-components";
import { useCourtPolicy } from "queries/useCourtPolicy";
import DisputeInfo from "components/DisputeCard/DisputeInfo";
import { responsiveSize } from "styles/responsiveSize";
import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import { Card } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import { css } from "styled-components";
import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  width: 100%;
  padding: 0px ${responsiveSize(10, 130)};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
  min-height: 100px;
  margin-bottom: ${responsiveSize(130, 70)};
`;
const PreviewContainer = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: ${responsiveSize(16, 32)};
  padding: ${responsiveSize(16, 32)};
`;

const Divider = styled.hr`
  width: 100%;
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;

const Header = styled.h2`
  margin-bottom: 32px;
  width: 84vw;
  text-align: center;
  color: ${({ theme }) => theme.secondaryPurple};
  ${landscapeStyle(
    () => css`
      width: auto;
    `
  )}
`;

const disputeTemplate = {
  title: "Freelance work disagreement between Alice and Bob",
  question: "How much should Alice receive?",
  description:
    "Bob hired Alice to develop a website for him. Bob claims the contract was not fully respected, and the website was delivered incomplete. For that reason, he wants to pay part of the agreed payment: 150 DAI. On the other hand, Alice claims she should receive the full payment: 250 DAI.",
  answers: [{ title: "Pay 250 DAI" }, { title: "Pay 150 DAI" }],
};
const Preview: React.FC = () => {
  const { data: courtPolicy } = useCourtPolicy("1");
  const courtName = courtPolicy?.name;

  return (
    <Container>
      <Header>Preview</Header>
      <StyledCard>
        <PreviewContainer>
          <DisputeContext disputeTemplate={disputeTemplate} />
          <Divider />

          <DisputeInfo
            isOverview={true}
            overrideIsList={true}
            courtId={"1"}
            court={"General court"}
            round={1}
            {...{ category: "Freelancing" }}
          />
        </PreviewContainer>
        <Policies disputePolicyURI={""} courtId={"1"} />
      </StyledCard>
      <NavigationButtons prevRoute="/resolver/policy" />
    </Container>
  );
};

export default Preview;
