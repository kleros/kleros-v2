import { BigNumber, utils } from "ethers";
import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { useWeb3 } from "hooks/useWeb3";
import { useJurorBalance } from "queries/useJurorBalance";

import Field from "components/Field";
import DiceIcon from "svgs/icons/dice.svg";
import LockerIcon from "svgs/icons/locker.svg";
import PNKIcon from "svgs/icons/pnk.svg";

const format = (value: BigNumber | undefined): string => (value !== undefined ? utils.formatEther(value) : "0");

const JurorBalanceDisplay = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const { data: jurorBalance } = useJurorBalance(account, id);

  const data = [
    {
      icon: PNKIcon,
      name: "My Stake",
      value: `${format(jurorBalance?.staked)} PNK`,
    },
    {
      icon: LockerIcon,
      name: "Locked Stake",
      value: `${format(jurorBalance?.locked)} PNK`,
    },
    {
      icon: DiceIcon,
      name: "Juror odds",
      value: "7.80%",
    },
  ];

  return (
    <Container>
      {data.map(({ icon, name, value }) => (
        <Field key={name} {...{ icon, name, value }} />
      ))}
    </Container>
  );
};

export default JurorBalanceDisplay;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
`;
