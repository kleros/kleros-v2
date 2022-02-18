import React from "react";
import { Rinkeby, ArbitrumRinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { Button } from "@kleros/ui-components-library";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";
import { IForeignGatewayDisputeData } from "queries/useForeignGatewayDisputeQuery";

const ActionButton: React.FC<{
  dispute: IForeignGatewayDisputeData;
  relayedHashes: string[];
}> = ({ dispute, relayedHashes }) => {
  const isRelayed = relayedHashes?.includes(dispute.disputeHash);
  return isRelayed ? (
    <ReimburseButton {...{ dispute }} />
  ) : (
    <RelayButton {...{ dispute }} />
  );
};

const RelayButton: React.FC<{ dispute: IForeignGatewayDisputeData }> = ({
  dispute,
}) => {
  const { call } =
    useContractCall("ForeignGateway", "arbitrationCost", Rinkeby.chainId) || {};
  const { sendWithSwitch, state } = useContractFunction(
    "HomeGateway",
    "relayCreateDispute",
    { chainId: ArbitrumRinkeby.chainId }
  );
  return (
    <Button
      small
      text="Relay"
      disabled={
        !["None", "Exception", "Success", "Fail"].includes(state.status)
      }
      onClick={() =>
        call(dispute.extraData).then((value: Result) => {
          const arbitrationCost = value.toString();
          sendWithSwitch(
            Rinkeby.chainId,
            dispute.blockHash,
            dispute.localDisputeID,
            dispute.choices,
            dispute.extraData,
            dispute.arbitrable,
            {
              value: arbitrationCost,
            }
          );
        })
      }
    />
  );
};

const ReimburseButton: React.FC<{ dispute: IForeignGatewayDisputeData }> = ({
  dispute,
}) => {
  const canReimburse = dispute.ruled && !dispute.paid.isZero();
  const { sendWithSwitch, state } = useContractFunction(
    "ForeignGateway",
    "withdrawFees",
    { chainId: Rinkeby.chainId }
  );
  return (
    <Button
      small
      text="Reimburse"
      disabled={
        !canReimburse ||
        !["None", "Exception", "Success", "Fail"].includes(state.status)
      }
      onClick={() => {
        sendWithSwitch(dispute.disputeHash);
      }}
    />
  );
};

export default ActionButton;
