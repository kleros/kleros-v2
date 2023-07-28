import React, { useRef } from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import { useFocusOutside } from "hooks/useFocusOutside";
import { Overlay } from "components/Overlay";
import DescriptionStakeWithdraw from "./Description/StakeWithdraw";
import DescriptionAppeal from "./Description/Appeal";
import DescriptionVoteWithoutCommit from "./Description/VoteWithoutCommit";
import DescriptionVoteWithCommit from "./Description/VoteWithCommit";
import ExtraInfoStakeWithdraw from "./ExtraInfo/StakeWithdraw";
import ExtraInfoVoteWithCommit from "./ExtraInfo/VoteWithCommit";

interface IPopup {
  title: string;
  icon: React.FC<React.SVGAttributes<SVGElement>> | string;
}

const Header = styled.h1`
  display: flex;
  margin-top: calc(12px + (32 - 12) * ((100vw - 300px) / (1250 - 300)));
  margin-bottom: calc(12px + (24 - 12) * ((100vw - 300px) / (1250 - 300)));
  font-size: 24px;
  font-weight: 600;
  line-height: 32.68px;
`;

const Icon = styled.svg`
  /* display: flex; */
`;

const StyledButton = styled(Button)`
  margin: calc(16px + (32 - 16) * ((100vw - 300px) / (1250 - 300)));
`;

const Container = styled.div`
  display: flex;
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translate(-50%);
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

const Popup: React.FC<IPopup> = ({ title, icon }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => {});

  return (
    <>
      <Overlay />
      <Container ref={containerRef}>
        <Header>{title}</Header>
        {/* <DescriptionVoteWithoutCommit date="25 August 2023" /> */}
        <DescriptionStakeWithdraw pnkStaked="230" courtName="Token Registry" isStake={true} courtId="1" />
        {/* <DescriptionAppeal amount="0.008" option="Pay 250 DAI" /> */}
        {icon && <Icon as={icon} />}
        <ExtraInfoStakeWithdraw />
        {/* <ExtraInfoVoteWithCommit /> */}
        <StyledButton variant="secondary" text="Close" />
      </Container>
    </>
  );
};
export default Popup;
