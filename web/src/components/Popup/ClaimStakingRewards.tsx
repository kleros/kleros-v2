import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import KlerosIcon from "svgs/icons/kleros.svg";
import { useFocusOutside } from "hooks/useFocusOutside";
import { Overlay } from "../Overlay";
import RightArrow from "tsx:svgs/icons/arrow.svg";
import RewardIcon from "tsx:svgs/icons/reward.svg";
import CloseIcon from "tsx:svgs/icons/close.svg";

const Container = styled.div`
  display: flex;
  position: relative;
  width: 862px;
  height: 636px;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 52px;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;
  z-index: 10;
`;

const StyledKlerosIcon = styled(KlerosIcon)`
  path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
  width: 112px;
  height: 100px;
`;

const PnkQuantityText = styled.text`
  font-size: 64px;
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryPurple};
  margin-top: 16px;
`;

const ThanksText = styled.text`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 16px;
`;

const ExplanationText = styled.text`
  font-size: 16px;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 8px;
`;

const Card = styled(_Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 112px;
  height: auto;
  margin-top: 35px;
  padding: 32px 24px;
  gap: 4px;

  ${landscapeStyle(() => css``)}
`;

const TotalClaimed = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Unclaimed = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const AmountText = styled.label`
  display: flex;
  font-size: 16px;
`;

const TotalClaimedAmount = styled.small`
  display: flex;
  font-size: 16px;
`;

const UnclaimedAmount = styled.small`
  display: flex;
  color: ${({ theme }) => theme.secondaryPurple};
  font-size: 16px;
`;

const ReadMore = styled.div`
  display: flex;
  color: ${({ theme }) => theme.primaryBlue};
  font-size: 16px;
  margin-top: 24px;
  gap: 8px;
  align-items: center;
`;

const ReadMoreLink = styled.a`
  display: flex;
  color: ${({ theme }) => theme.primaryBlue};
  font-size: 16px;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledRightArrow = styled(RightArrow)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const StyledButton = styled.div`
  display: flex;
  width: 238px;
  padding: 11px 0;
  background-color: ${({ theme }) => theme.secondaryPurple};
  margin-top: 36px;
  color: ${({ theme }) => theme.whiteBackground};
  font-size: 14px;
  font-weight: 600;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  gap: 8px;
  cursor: pointer;
`;

const StyledRewardIcon = styled(RewardIcon)`
  path {
    fill: ${({ theme }) => theme.whiteBackground};
  }

  width: 18px;
  height: 16px;
`;

const StyledCloseIcon = styled(CloseIcon)`
  position: absolute;
  width: 18px;
  height: 18px;
`;

interface IClaimStakingRewards {
  toggleIsOpen: () => void;
}

const ClaimStakingRewards: React.FC<IClaimStakingRewards> = ({ toggleIsOpen }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => toggleIsOpen());

  return (
    <>
      <Overlay />
      <Container ref={containerRef}>
        <StyledKlerosIcon />
        <PnkQuantityText>1,000 PNK</PnkQuantityText>
        <ThanksText>🎉 Thanks for being part of the community! 🎉</ThanksText>
        <ExplanationText>As a Kleros Juror, you will earn PNK for staking in Court.</ExplanationText>
        <Card>
          <TotalClaimed>
            <AmountText>Total Rewarded PNK:</AmountText>
            <TotalClaimedAmount>10,000 PNK</TotalClaimedAmount>
          </TotalClaimed>
          <Unclaimed>
            <AmountText>Unclaimed:</AmountText>
            <UnclaimedAmount>1,000 PNK</UnclaimedAmount>
          </Unclaimed>
        </Card>
        <ReadMore>
          <ReadMoreLink
            href="https://blog.kleros.io/the-launch-of-the-kleros-juror-incentive-program/"
            target="_blank"
            rel="noreferrer"
          >
            Read more about the Juror Incentive Program
          </ReadMoreLink>
          <StyledRightArrow />
        </ReadMore>
        <StyledButton>
          <StyledRewardIcon />
          Claim Your PNK Tokens
        </StyledButton>
        <StyledCloseIcon />
      </Container>
    </>
  );
};

export default ClaimStakingRewards;
