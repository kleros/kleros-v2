import React from "react";
import styled from "styled-components";
import { Rinkeby, ArbitrumRinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { Button } from "@kleros/ui-components-library";
import { Skeleton } from "components/skeleton-provider";
import Table from "components/table";
import { useFormatedOutgoingDisputeQuery } from "queries/useOutgoingDisputeQuery";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

const StyledTable = styled(Table)`
  height: 90%;
  width: 100%;
`;

const tableColumnsNames = [
  "Local Dispute ID",
  "Dispute Hash",
  "Choices",
  "extraData",
  "Arbitrable",
  "Arbitrable Cost",
  "Action",
];

const SimpleBridge = () => {
  const { call } =
    useContractCall("ForeignGateway", "arbitrationCost", Rinkeby.chainId) || {};
  const { sendWithSwitch, state } = useContractFunction(
    "HomeGateway",
    "relayCreateDispute",
    { chainId: ArbitrumRinkeby.chainId }
  );
  const { data, rawData } = useFormatedOutgoingDisputeQuery();
  const rows = rawData
    ? data?.map((row: any[], i) => {
        const newRow = row.slice(0, -2);
        const txData = rawData[i];
        newRow.push(
          <Button
            key={0}
            small
            text="Relay"
            disabled={
              !["None", "Exception", "Success", "Fail"].includes(state.status)
            }
            onClick={() =>
              call(txData[4]).then((value: Result) => {
                const arbitrationCost = value.toString();
                sendWithSwitch(
                  Rinkeby.chainId,
                  txData[1],
                  txData[2],
                  txData[3],
                  txData[4],
                  txData[5],
                  {
                    value: arbitrationCost,
                  }
                );
              })
            }
          />
        );
        return newRow;
      })
    : [];
  return (
    <Wrapper>
      <StyledTable
        rows={
          rows
            ? rows
            : [Array(tableColumnsNames.length).fill([<Skeleton key={0} />])]
        }
        columnNames={tableColumnsNames}
        title="Outgoing Dispute Creations"
      />
    </Wrapper>
  );
};

export default SimpleBridge;
