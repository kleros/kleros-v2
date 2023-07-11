import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Identicon from "react-identicons";
import ArrowIcon from "assets/svgs/icons/arrow.svg";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useKlerosCoreCurrentRuling } from "hooks/contracts/generated";
import LightButton from "../LightButton";
import VerdictBanner from "./VerdictBanner";

const Container = styled.div`
  width: 100%;
`;

const JuryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  h3 {
    line-height: 21px;
  }
`;

const JuryDecisionTag = styled.small`
  font-weight: 400;
  line-height: 19px;
  color: ${({ theme }) => theme.secondaryText};
`;

const Divider = styled.hr`
  color: ${({ theme }) => theme.stroke};
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 22px 0px;
  gap: 10px;
`;

const AliasTag = styled.div`
  display: flex;
  flex-direction: column;
  small {
    font-weight: 400;
    line-height: 19px;
  }
`;

const StyledIdenticon = styled(Identicon)`
  width: 24px;
  height: 24px;
  border-radius: 100%;
`;

const Header = styled.h1`
  margin: 20px 0px 32px 0px;
`;

const Title = styled.small`
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledButton = styled(LightButton)`
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  > .button-text {
    color: ${({ theme }) => theme.primaryBlue};
  }
`;

const AnswerTitle = styled.h3`
  margin: 0;
`;

const FinalDecision: React.FC = () => {
  const { id } = useParams();
  const { data: disputeTemplate } = useDisputeTemplate(id);
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const ruled = disputeDetails?.dispute?.ruled ?? false;
  const navigate = useNavigate();
  const { data: currentRulingArray } = useKlerosCoreCurrentRuling({ args: [BigInt(id ?? 0)], watch: true });
  const currentRuling = Number(currentRulingArray?.[0]);
  const answer = disputeTemplate?.answers?.[currentRuling! - 1];

  return (
    <Container>
      <VerdictBanner ruled={ruled} />
      <Header> {ruled ? "Final Decision" : "Current Ruling"} </Header>
      <JuryContainer>
        <JuryDecisionTag>The jury decided in favor of:</JuryDecisionTag>
        {answer ? (
          <div>
            <AnswerTitle>{answer.title}</AnswerTitle>
            <small>{answer.description}</small>
          </div>
        ) : (
          <h3>Refuse to Arbitrate</h3>
        )}
      </JuryContainer>
      <Divider />
      {disputeTemplate?.aliases && (
        <>
          <UserContainer>
            <StyledIdenticon size="24" />
            <AliasTag>
              {disputeTemplate?.aliases?.challenger && <small>Alice.eth</small>}
              <Title>Claimant</Title>
            </AliasTag>
          </UserContainer>
          <Divider />
        </>
      )}
      <StyledButton
        onClick={() => navigate(`/cases/${id?.toString()}/voting`)}
        text={"Check how the jury voted"}
        Icon={ArrowIcon}
        className="reverse-button"
      />
    </Container>
  );
};

export default FinalDecision;
