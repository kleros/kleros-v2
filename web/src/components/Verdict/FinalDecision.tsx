import React from "react";
import styled from "styled-components";
import Identicon from "react-identicons";
import { useNavigate } from "react-router-dom";
import ArrowIcon from "assets/svgs/icons/arrow.svg";
import LightButton from "../LightButton";
import VerdictBanner from "./VerdictBanner";

const Container = styled.div`
  position: relative;
  width: calc(200px + (360 - 200) * (100vw - 375px) / (1250 - 375));

  height: 400px;
  margin-left: 16px;
  .reverse-button {
    display: flex;
    flex-direction: row-reverse;
    gap: 8px;
    .button-text {
      color: ${({ theme }) => theme.primaryBlue};
    }
  }
`;

const JuryContanier = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 32px;
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
  color: ${({ theme }) => theme.secondaryText};
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
  margin: 20px 0px 48px;
`;

const Title = styled.small`
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledButton = styled(LightButton)`
  position: absolute;
  bottom: 0;
`;

interface IFinalDecision {
  id: string;
  disputeDetails: any;
}

const FinalDecision: React.FC<IFinalDecision> = ({ id, disputeDetails }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/cases/${id.toString()}/voting`);
  };

  return (
    <Container>
      <VerdictBanner />
      <Header>Final Decision</Header>
      <JuryContanier>
        <JuryDecisionTag>The jury decided in favor of:</JuryDecisionTag>
        <h3>Pay 250 DAI</h3>
      </JuryContanier>
      <Divider />
      <UserContainer>
        <StyledIdenticon size="24" />
        <AliasTag>
          <small>Alice.eth</small>
          <Title>Claimant</Title>
        </AliasTag>
      </UserContainer>
      <Divider />
      <StyledButton
        onClick={handleClick}
        text={"Check how the jury voted"}
        Icon={ArrowIcon}
        className="reverse-button"
      />
    </Container>
  );
};
export default FinalDecision;
