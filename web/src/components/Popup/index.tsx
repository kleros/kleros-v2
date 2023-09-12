import React, { useRef } from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import { Overlay } from "components/Overlay";
import StakeWithdraw from "./Description/StakeWithdraw";
import VoteWithCommit from "./Description/VoteWithCommit";
import VoteWithoutCommit from "./Description/VoteWithoutCommit";
import Appeal from "./Description/Appeal";
import VoteWithCommitExtraInfo from "./ExtraInfo/VoteWithCommitExtraInfo";
import StakeWithdrawExtraInfo from "./ExtraInfo/StakeWithdrawExtraInfo";

const Header = styled.h1`
  display: flex;
  margin-top: calc(12px + (32 - 12) * ((100vw - 375px) / (1250 - 375)));
  margin-bottom: calc(12px + (24 - 12) * ((100vw - 375px) / (1250 - 375)));
  margin-left: calc(8px + (12 - 8) * ((100vw - 375px) / (1250 - 375)));
  margin-right: calc(8px + (12 - 8) * ((100vw - 375px) / (1250 - 375)));
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  line-height: 32.68px;
`;

const IconContainer = styled.div`
  width: calc(150px + (228 - 150) * (100vw - 375px) / (1250 - 375));
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: inline-block;
    width: calc(150px + (228 - 150) * (100vw - 375px) / (1250 - 375));
    height: calc(150px + (228 - 150) * (100vw - 375px) / (1250 - 375));
  }
`;

const StyledButton = styled(Button)`
  margin: calc(16px + (32 - 16) * ((100vw - 375px) / (1250 - 375)));
`;

const Container = styled.div`
  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 10;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(300px + (600 - 300) * (100vw - 375px) / (1250 - 375));
  max-width: 600px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  svg {
    visibility: visible;
  }
`;

const VoteDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: calc(16px + (32 - 16) * ((100vw - 375px) / (1250 - 375)));
  margin-left: calc(8px + (32 - 8) * ((100vw - 375px) / (1250 - 375)));
  margin-right: calc(8px + (32 - 8) * ((100vw - 375px) / (1250 - 375)));
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
interface IPopup {
  title: string;
  icon: React.FC<React.SVGAttributes<SVGElement>>;
  popupType: PopupType;
  setIsOpen: (val: boolean) => void;
  setAmount?: (val: string) => void;
  isCommit?: boolean;
}

type PopupProps = IStakeWithdraw | IVoteWithoutCommit | IVoteWithCommit | IAppeal;

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
        <StyledButton
          variant="secondary"
          text="Close"
          onClick={() => {
            setIsOpen(false);
            resetValue();
          }}
        />
      </Container>
    </>
  );
};
export default Popup;
