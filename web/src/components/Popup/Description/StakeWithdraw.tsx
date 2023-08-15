import React from "react";
import styled from "styled-components";
import { isUndefined } from "utils/index";
import { useAccount } from "wagmi";
import { useKlerosCoreGetJurorBalance } from "hooks/contracts/generated";
import { format } from "src/pages/Dashboard/Courts/CourtCard";
import KlerosLogo from "tsx:svgs/icons/kleros.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledKlerosLogo = styled(KlerosLogo)`
  width: 14px;
  height: 14px;
`;

const StyledTitle = styled.div`
  display: flex;
  margin-bottom: calc(16px + (32 - 16) * ((100vw - 300px) / (1250 - 300)));
  margin-left: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-right: calc(8px + (44 - 8) * ((100vw - 300px) / (1250 - 300)));
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

const AmountStakedOrWithdrawnContainer = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryPurple};
  margin-bottom: calc(0px + (4 - 0) * ((100vw - 300px) / (1250 - 300)));
`;

const TotalStakeContainer = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  justify-content: center;
  margin-bottom: calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
`;

const MyStakeContainer = styled.div`
  display: flex;
  margin: 0px calc(4px + (8 - 4) * ((100vw - 300px) / (1250 - 300)));
  color: ${({ theme }) => theme.secondaryText};
`;

const AmountContainer = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
`;

interface IStakeWithdraw {
  pnkStaked: string;
  courtName: string;
  isStake: boolean;
  courtId: string;
}

interface IAmountStakedOrWithdrawn {
  pnkStaked: string;
  isStake: boolean;
}

const AmountStakedOrWithdrawn: React.FC<IAmountStakedOrWithdrawn> = ({ pnkStaked, isStake }) => {
  return isStake ? <div>+ {pnkStaked} PNK</div> : <div>- {pnkStaked} PNK</div>;
};

const StakeWithdraw: React.FC<IStakeWithdraw> = ({ pnkStaked, courtName, isStake, courtId }) => {
  const { address } = useAccount();

  const { data: jurorBalance } = useKlerosCoreGetJurorBalance({
    enabled: !isUndefined(address) && !isUndefined(courtId),
    args: [address, BigInt(courtId)],
    watch: true,
  });

  return (
    <Container>
      <StyledTitle>
        🎉 Your {isStake ? "stake" : "unstake"} in the {courtName} court was successful! 🎉
      </StyledTitle>
      <AmountStakedOrWithdrawnContainer>
        <AmountStakedOrWithdrawn pnkStaked={pnkStaked} isStake={isStake} />
      </AmountStakedOrWithdrawnContainer>

      <TotalStakeContainer>
        <StyledKlerosLogo /> <MyStakeContainer>My Stake:</MyStakeContainer>{" "}
        <AmountContainer>{`${format(jurorBalance?.[0])} PNK`} </AmountContainer>
      </TotalStakeContainer>
    </Container>
  );
};
export default StakeWithdraw;
