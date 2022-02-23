import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ArbitrumRinkeby } from "@usedapp/core";
import { utils } from "ethers";
import { Result } from "@ethersproject/abi";
import { Skeleton } from "components/skeleton-provider";
import Table from "../../table";
import { IKlerosCoreTokenAndETHShift } from "queries/useKlerosCoreJurorsQuery";
import { useContractCall } from "hooks/useContractCall";

const columnNames = ["Address", "Staked PNK", "Locked PNK", "Last Performance"];

const stakedPNKtemplate = (amount: string) =>
  `${amount} PNK in General sub-court.`;

const lockedPNKtemplate = (amount: string) =>
  `${amount} PNK in General sub-court.`;

const lastPerformancetemplate = (tokenAmount: string, ethAmount: string) => {
  if (tokenAmount && ethAmount) return `${tokenAmount} PNK, ${ethAmount} ETH`;
  else return "No performance yet.";
};

const formatData = async (
  juror: string,
  call: ((...args: any[]) => Promise<Result>) | undefined,
  shifts?: IKlerosCoreTokenAndETHShift[]
): Promise<React.ReactNode[]> => {
  if (shifts && call) {
    const jurorShifts = shifts.filter((shift) => shift.address === juror);
    const lastShift = jurorShifts[-1];
    const stakedBalance = await call(juror, 0);
    console.log(stakedBalance)
    return [
      juror,
      stakedPNKtemplate(utils.formatEther(stakedBalance?.at(0).toString())),
      lockedPNKtemplate(utils.formatEther(stakedBalance?.at(1).toString())),
      lastPerformancetemplate(
        lastShift?.tokenAmount.toString(),
        lastShift?.ethAmount.toString()
      ),
    ];
  }
  return [];
};

const StyledTable = styled(Table)`
  height: 40%;
  width: 100%;
`;

const DisputesTable: React.FC<{
  jurors?: string[];
  shifts?: IKlerosCoreTokenAndETHShift[];
}> = ({ jurors, shifts }) => {
  const [rows, setRows] = useState<React.ReactNode[][]>();
  const { call } =
    useContractCall("KlerosCore", "getJurorBalance", ArbitrumRinkeby.chainId) ||
    {};
  useEffect(() => {
    const _formatData = async (juror: string) =>
      await formatData(juror, call, shifts);
    const test = async () => {
      if (jurors) {
        const newRows = await Promise.all(
          jurors.map(async (juror: string) => await _formatData(juror))
        );
        if (newRows.length > 0) setRows(newRows);
      }
    };
    test();
  }, [jurors]);
  return (
    <StyledTable
      rows={rows ? rows : [Array(columnNames.length).fill(<Skeleton />)]}
      {...{ columnNames }}
      title="Jurors"
    />
  );
};

export default DisputesTable;
