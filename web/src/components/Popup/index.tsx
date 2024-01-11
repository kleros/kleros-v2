import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Button } from "@kleros/ui-components-library";
import { Overlay } from "components/Overlay";
import StakeWithdraw from "./Description/StakeWithdraw";
import VoteWithCommit from "./Description/VoteWithCommit";
import VoteWithoutCommit from "./Description/VoteWithoutCommit";
import Appeal from "./Description/Appeal";
import VoteWithCommitExtraInfo from "./ExtraInfo/VoteWithCommitExtraInfo";
import StakeWithdrawExtraInfo from "./ExtraInfo/StakeWithdrawExtraInfo";
import { responsiveSize } from "styles/responsiveSize";
import DisputeCreated from "./Description/DisputeCreated";
import DisputeCreatedExtraInfo from "./ExtraInfo/DisputeCreatedExtraInfo";
import { useNavigate } from "react-router-dom";

const Header = styled.h1`
  display: flex;
  margin: ${responsiveSize(12, 32)} ${responsiveSize(8, 12)} ${responsiveSize(12, 24)};
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  line-height: 32.68px;
`;

const IconContainer = styled.div`
  width: ${responsiveSize(150, 228)};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: inline-block;
    width: ${responsiveSize(150, 228)};
    height: ${responsiveSize(150, 228)};
  }
`;

const StyledButton = styled(Button)`
  margin: ${responsiveSize(16, 32)};
`;

const Container = styled.div`
  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;

  z-index: 10;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 86vw;
  max-width: 600px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  svg {
    visibility: visible;
  }

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      width: ${responsiveSize(300, 600)};
    `
  )}
`;

const VoteDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${responsiveSize(16, 32)};
  margin-left: ${responsiveSize(8, 32)};
  margin-right: ${responsiveSize(8, 32)};
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  line-height: 21.8px;
`;

export const VoteDescriptionEmphasizedDate = styled.span`
  font-size: 16px;
  font-weight: 400;
  line-height: 21.8px;
  color: ${({ theme }) => theme.primaryText};
`;

export enum PopupType {
  STAKE_WITHDRAW = "STAKE_WITHDRAW",
  APPEAL = "APPEAL",
  VOTE_WITHOUT_COMMIT = "VOTE_WITHOUT_COMMIT",
  VOTE_WITH_COMMIT = "VOTE_WITH_COMMIT",
  DISPUTE_CREATED = "DISPUTE_CREATED",
}

interface IStakeWithdraw {
  popupType: PopupType.STAKE_WITHDRAW;
  pnkStaked: string;
  courtName: string;
  isStake: boolean;
  courtId: string;
}

interface IVoteWithoutCommit {
  popupType: PopupType.VOTE_WITHOUT_COMMIT;
  date: string;
}

interface IVoteWithCommit {
  popupType: PopupType.VOTE_WITH_COMMIT;
  date: string;
}

interface IAppeal {
  popupType: PopupType.APPEAL;
  amount: string;
  option: string;
}
interface IDisputeCreated {
  popupType: PopupType.DISPUTE_CREATED;
  disputeId: number;
  courtId: string;
}
interface IPopup {
  title: string;
  icon: React.FC<React.SVGAttributes<SVGElement>>;
  popupType: PopupType;
  setIsOpen: (val: boolean) => void;
  setAmount?: (val: string) => void;
  isCommit?: boolean;
}

type PopupProps = IStakeWithdraw | IVoteWithoutCommit | IVoteWithCommit | IAppeal | IDisputeCreated;

const Popup: React.FC<PopupProps & IPopup> = ({
  title,
  icon: Icon,
  popupType,
  setIsOpen,
  setAmount,
  isCommit,
  ...props
}) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const resetValue = () => {
    if (setAmount) {
      setAmount("");
    }
  };

  let PopupComponent: JSX.Element | null = null;

  switch (popupType) {
    case PopupType.STAKE_WITHDRAW: {
      const { pnkStaked, courtName, isStake, courtId } = props as IStakeWithdraw;
      PopupComponent = (
        <StakeWithdraw pnkStaked={pnkStaked} courtName={courtName} isStake={isStake} courtId={courtId} />
      );
      break;
    }
    case PopupType.VOTE_WITHOUT_COMMIT: {
      const { date } = props as IVoteWithoutCommit;
      PopupComponent = (
        <VoteDescriptionContainer>
          <VoteWithoutCommit date={date} />
        </VoteDescriptionContainer>
      );
      break;
    }
    case PopupType.VOTE_WITH_COMMIT: {
      const { date } = props as IVoteWithCommit;
      PopupComponent = (
        <VoteDescriptionContainer>
          <VoteWithCommit date={date} />
        </VoteDescriptionContainer>
      );
      break;
    }
    case PopupType.APPEAL: {
      const { amount, option } = props as IAppeal;
      PopupComponent = <Appeal amount={amount} option={option} />;
      break;
    }
    case PopupType.DISPUTE_CREATED: {
      const { courtId } = props as IDisputeCreated;
      PopupComponent = <DisputeCreated courtId={courtId} />;
      break;
    }
    default:
      break;
  }

  return (
    <>
      <Overlay />
      <Container ref={containerRef}>
        <Header>{title}</Header>
        {PopupComponent}
        <IconContainer>
          <Icon />
        </IconContainer>
        {popupType === PopupType.STAKE_WITHDRAW && <StakeWithdrawExtraInfo />}
        {popupType === PopupType.VOTE_WITH_COMMIT && <VoteWithCommitExtraInfo />}
        {popupType === PopupType.DISPUTE_CREATED && <DisputeCreatedExtraInfo />}
        <StyledButton
          variant="secondary"
          text={popupType === PopupType.DISPUTE_CREATED ? "Check the case" : "Close"}
          onClick={() => {
            setIsOpen(false);
            resetValue();
            if (popupType === PopupType.DISPUTE_CREATED) {
              const { disputeId } = props as IDisputeCreated;
              navigate(`/cases/${disputeId}`);
            }
          }}
        />
      </Container>
    </>
  );
};
export default Popup;
