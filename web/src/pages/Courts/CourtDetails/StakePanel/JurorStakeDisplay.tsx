import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { BigNumber, utils } from "ethers";

import { useJurorBalance } from "queries/useJurorBalance";
import { useWeb3 } from "hooks/useWeb3";

import Field from "components/Field";
import LawBalanceIcon from "svgs/icons/pnk.svg";

const format = (value: BigNumber | undefined) =>
  value !== undefined ? utils.formatEther(value) : "0";

const JurorBalanceDisplay = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const { data: jurorBalance } = useJurorBalance(account, id);

  return (
    <Container>
      <Field
        icon={LawBalanceIcon}
        name="My Stake"
        value={`${format(jurorBalance?.staked)} PNK`}
        width="fit-content"
      />
      <Field
        icon={LawBalanceIcon}
        name="Locked Stake"
        value={`${format(jurorBalance?.locked)} PNK`}
        width="fit-content"
      />
      <Field
        icon={LawBalanceIcon}
        name="Juror odds"
        value="7.80%"
        width="fit-content"
      />
    </Container>
  );
};

export default JurorBalanceDisplay;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;
