import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";

import { useJurorBalance } from "hooks/useJurorBalance";
import { useWeb3 } from "hooks/useWeb3";
import LawBalanceIcon from "svgs/icons/pnk.svg";
import Field from "components/Field";

const JurorBalanceDisplay = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const jurorBalance = useJurorBalance(account, id);

  return (
    <Container>
      <Field
        icon={LawBalanceIcon}
        name="My Stake"
        value={`${jurorBalance.staked} PNK`}
        width="fit-content"
      />
      <Field
        icon={LawBalanceIcon}
        name="Locked Stake"
        value={`${jurorBalance.locked} PNK`}
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
