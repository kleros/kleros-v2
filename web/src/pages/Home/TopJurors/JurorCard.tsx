import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";
import EthIcon from "assets/svgs/icons/eth.svg";
import PnkIcon from "assets/svgs/icons/kleros.svg";
import PixelArt from "pages/Dashboard/JurorInfo/PixelArt";
import { getUserLevelData } from "utils/userLevelCalculation";
import { useUserQuery } from "hooks/queries/useUser";

const Container = styled.div<{ id?: number }>`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 24px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top: ${({ id }) => (id === 1 ? "" : "none")};
  align-items: center;

  label {
    font-size: 16px;
  }

  ${landscapeStyle(
    () => css`
      gap: 0px;
      padding: 15.55px 32px;
      flex-wrap: nowrap;
    `
  )}
`;

const LogoAndAddress = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  canvas {
    width: 20px;
    height: 20px;
    border-radius: 10%;
  }
`;

const TitleAndRewardsAndCoherency = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${landscapeStyle(
    () =>
      css`
        flex-direction: row;
        gap: 32px;
      `
  )}
`;

const JurorTitle = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;

  ${landscapeStyle(
    () => css`
      width: calc(140px + (260 - 140) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      gap: 36px;
    `
  )}
`;

const Rewards = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  label {
    font-weight: 600;
  }
  width: 132px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () =>
      css`
        width: calc(80px + (180 - 80) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      `
  )}
`;

const Coherency = styled.div`
  display: flex;
  align-items: center;
  label {
    font-weight: 600;
  }
  flex-wrap: wrap;
`;

const StyledIcon = styled.div`
  width: 16px;
  height: 16px;

  path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const HowItWorks = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledIdenticonOrAvatar = styled(IdenticonOrAvatar)``;

interface IJurorCard {
  id: number;
  address: `0x${string}`;
}

const JurorCard: React.FC<IJurorCard> = ({ id, address }) => {
  const ethReward = "11";
  const pnkReward = "30K";
  const coherentVotes = "10/12";

  const { data } = useUserQuery(address?.toLowerCase());
  const totalCoherent = data?.user ? parseInt(data?.user?.totalCoherent) : 0;
  const totalResolvedDisputes = data?.user ? parseInt(data?.user?.totalResolvedDisputes) : 1;
  // const userLevelData = getUserLevelData(totalCoherent, totalResolvedDisputes);
  const userLevelData = {
    level: 4,
  };

  return (
    <Container id={id}>
      <TitleAndRewardsAndCoherency>
        <JurorTitle>
          <label>{id}</label>
          <LogoAndAddress>
            <StyledIdenticonOrAvatar address={address} />
            <AddressOrName address={address} />
          </LogoAndAddress>
        </JurorTitle>
        <Rewards>
          <label>{ethReward}</label>
          <StyledIcon as={EthIcon} />
          <label>+</label>
          <label>{pnkReward}</label>
          <StyledIcon as={PnkIcon} />
        </Rewards>
        <Coherency>
          <label>{coherentVotes}</label>
        </Coherency>
      </TitleAndRewardsAndCoherency>
      <HowItWorks>
        <label> Level {userLevelData.level}</label>
        <PixelArt width="32" height="32" level={userLevelData.level} />
      </HowItWorks>
    </Container>
  );
};

export default JurorCard;
