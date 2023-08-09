import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { isUndefined } from "utils/index";
import Field from "components/Field";
import DiceIcon from "svgs/icons/dice.svg";
import LockerIcon from "svgs/icons/locker.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import { useCourtDetails } from "queries/useCourtDetails";
import { useKlerosCoreGetJurorBalance } from "hooks/contracts/generated";

const format = (value: bigint | undefined): string => (value !== undefined ? formatEther(value) : "0");

const bigIntRatioToPercentage = (numerator: bigint, denominator: bigint): string => {
  const decimalPlaces = 2;
  const factor = BigInt(10) ** BigInt(decimalPlaces);
  const intermediate = (numerator * factor * 100n) / denominator;
  const result = intermediate.toString();
  const pointIndex = result.length - decimalPlaces;
  const integerPart = result.slice(0, pointIndex) || "0";
  const decimalPart = result.slice(pointIndex);
  return `${integerPart}${decimalPart.length > 0 ? "." + decimalPart : ".00"}%`;
};

const calculateJurorOdds = (jurorBalance, stakedByAllJurors, loading) => {
  if (loading || !jurorBalance || !stakedByAllJurors || stakedByAllJurors === "0") {
    return "0.00%";
  }
  return bigIntRatioToPercentage(jurorBalance[0], BigInt(stakedByAllJurors));
};

const JurorBalanceDisplay = () => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: jurorBalance } = useKlerosCoreGetJurorBalance({
    enabled: !isUndefined(address),
    args: [address ?? "0x", BigInt(id ?? 0)],
    watch: true,
  });
  const { data: courtDetails } = useCourtDetails(id);
  const stakedByAllJurors = courtDetails?.court?.stake;

  const [loading, setLoading] = useState(false);
  const [previousJurorBalance, setPreviousJurorBalance] = useState<bigint | undefined>(undefined);
  const [previousStakedByAllJurors, setPreviousStakedByAllJurors] = useState<bigint | undefined>(undefined);

  useEffect(() => {
    if (previousJurorBalance !== undefined && jurorBalance?.[0] !== previousJurorBalance) {
      setLoading(true);
    }
    setPreviousJurorBalance(jurorBalance?.[0]);
  }, [jurorBalance, previousJurorBalance]);

  useEffect(() => {
    if (loading && stakedByAllJurors !== undefined && BigInt(stakedByAllJurors) !== previousStakedByAllJurors) {
      setLoading(false);
    }
    if (stakedByAllJurors !== undefined) {
      setPreviousStakedByAllJurors(BigInt(stakedByAllJurors));
    }
  }, [stakedByAllJurors, loading, previousStakedByAllJurors]);

  const jurorOdds = loading ? "Calculating..." : calculateJurorOdds(jurorBalance, stakedByAllJurors, loading);

  const data = [
    {
      icon: PNKIcon,
      name: "My Stake",
      value: `${format(jurorBalance?.[0])} PNK`,
    },
    {
      icon: LockerIcon,
      name: "Locked Stake",
      value: `${format(jurorBalance?.[1])} PNK`,
    },
    {
      icon: DiceIcon,
      name: "Juror odds",
      value: jurorOdds,
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
