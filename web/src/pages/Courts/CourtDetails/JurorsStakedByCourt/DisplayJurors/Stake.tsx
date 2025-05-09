import React from "react";
import styled from "styled-components";

import { formatPNK } from "utils/format";

interface IStake {
  effectiveStake: string;
}

const StyledLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
`;

const Stake: React.FC<IStake> = ({ effectiveStake }) => {
  return <StyledLabel> {formatPNK(BigInt(effectiveStake))} </StyledLabel>;
};
export default Stake;
