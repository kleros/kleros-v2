import React from "react";
import styled from "styled-components";
import { IdenticonOrAvatar, AddressOrName } from "components/ConnectWallet/AccountDisplay";
import EthIcon from "assets/svgs/icons/eth.svg";
import PnkIcon from "assets/svgs/icons/kleros.svg";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 19.5px 32px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;

  label {
    font-size: 16px;
  }
`;

const JurorTitle = styled.div`
  display: flex;
  gap: 36px;
  align-items: center;
  width: 372px;
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

const JurorData = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: calc(24px + (48 - 24) * ((100vw - 300px) / (1250 - 300)));
`;

const RewardsAndCoherency = styled.div`
  display: flex;
  gap: calc(52px + (104 - 52) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Rewards = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  label {
    font-weight: 600;
  }
  width: 132px;
`;

const Coherency = styled.div`
  align-items: center;
  label {
    font-weight: 600;
  }
`;

const StyledIcon = styled.div`
  width: 16px;
  height: 16px;

  path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
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

  return (
    <Container>
      <JurorTitle>
        <label>{id}</label>
        <LogoAndAddress>
          <StyledIdenticonOrAvatar address={address} />
          <AddressOrName address={address} />
        </LogoAndAddress>
      </JurorTitle>
      <JurorData>
        <RewardsAndCoherency>
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
        </RewardsAndCoherency>
        {/*"How it works" section here*/}
      </JurorData>
    </Container>
  );
};

export default JurorCard;
