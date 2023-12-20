import React from "react";
import styled from "styled-components";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { isUndefined } from "utils/index";
import { useSortitionModuleGetJurorBalance } from "hooks/contracts/generated";
import KlerosLogo from "tsx:svgs/icons/kleros.svg";
import { responsiveSize } from "styles/responsiveSize";

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
  margin-bottom: ${responsiveSize(16, 32, 300)};
  margin-left: ${responsiveSize(8, 44, 300)};
  margin-right: ${responsiveSize(8, 44, 300)};
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

const AmountStakedOrWithdrawnContainer = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryPurple};
  margin-bottom: ${responsiveSize(0, 4, 300)};
`;

const TotalStakeContainer = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${responsiveSize(8, 32, 300)};
`;

const MyStakeContainer = styled.div`
  display: flex;
  margin: 0px ${responsiveSize(4, 8, 300)};
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

  const { data: jurorBalance } = useSortitionModuleGetJurorBalance({
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
        <AmountContainer>{`${formatUnits(jurorBalance?.[2] ?? BigInt(0), 18)} PNK`} </AmountContainer>
      </TotalStakeContainer>
    </Container>
  );
};
export default StakeWithdraw;
