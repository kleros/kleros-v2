import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Card as _Card, Breadcrumb } from "@kleros/ui-components-library";
import { isUndefined } from "utils/index";
import { useKlerosCoreGetJurorBalance } from "hooks/contracts/generated";

const Card = styled(_Card)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 21.5px 32px 21.5px 27px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  flex-wrap: wrap;
`;

const CourtName = styled.div`
  small {
    height: 100%;
  }

  ${landscapeStyle(() => css``)}
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  display: flex;
  align-items: center;
  height: 100%;
`;

const StakesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${landscapeStyle(() => css``)}
`;

const Stake = styled.div`
  display: flex;
  width: 69px;
  label {
    font-weight: 600;
    color: ${({ theme }) => theme.primaryText};
  }
`;

const LockedStake = styled.div`
  display: flex;
  gap: 8px;
  width: 112px;
  justify-content: flex-end;
  align-items: flex-end;

  label {
    color: ${({ theme }) => theme.primaryText};
  }
`;

interface ICourtCard {
  id: string;
  name: string;
}

const CourtCard: React.FC<ICourtCard> = ({ id, name }) => {
  const { address } = useAccount();
  const { data: jurorBalance } = useKlerosCoreGetJurorBalance({
    enabled: !isUndefined(address),
    args: [address!, BigInt(id)],
    watch: true,
  });

  const stake = jurorBalance?.[0] ?? BigInt(0);
  const lockedStake = jurorBalance?.[1] ?? BigInt(0);
  const formatedStake = formatUnits(stake, 18);
  const formatedLockedStake = formatUnits(lockedStake, 18);

  return stake > 0 || lockedStake > 0 ? (
    <Card>
      <CourtName>
        <StyledBreadcrumb items={[{ text: name, value: 0 }]} />
      </CourtName>
      <StakesContainer>
        <Stake>
          <label>{`${formatedStake} PNK`}</label>
        </Stake>
        <LockedStake>
          <label>{`${formatedLockedStake} PNK`}</label>
        </LockedStake>
      </StakesContainer>
    </Card>
  ) : null;
};

export default CourtCard;
