import React from "react";
import { Rinkeby, ArbitrumRinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";
import { IForeignGatewayDisputeData } from "queries/useForeignGatewayDisputeQuery";

const ActionButton: React.FC<{
  dispute: IForeignGatewayDisputeData;
  relayedHashes?: string[];
  isLoading: boolean;
}> = ({ dispute, relayedHashes, isLoading }) => {
  const isRelayed = relayedHashes?.includes(dispute.disputeHash);
  return isRelayed ? (
    <ReimburseButton {...{ dispute, isLoading }} />
  ) : (
    <RelayButton {...{ dispute, isLoading }} />
  );
};

const RelayButton: React.FC<{
  dispute: IForeignGatewayDisputeData;
  isLoading: boolean;
}> = ({ dispute, isLoading }) => {
  const { call } =
    useContractCall("ForeignGateway", "arbitrationCost", Rinkeby.chainId) || {};
  const { sendWithSwitch, send, state } = useContractFunction(
    "HomeGateway",
    "relayCreateDispute",
    { chainId: ArbitrumRinkeby.chainId }
  );
  return sendWithSwitch({
    small: true,
    text: "Relay",
    disabled:
      isLoading || !["None", "Exception", "Fail"].includes(state.status),
    onClick: () =>
      call &&
      call(dispute.extraData).then((value: Result) => {
        const arbitrationCost = value.toString();
        send(
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
      }),
  });
};

const ReimburseButton: React.FC<{
  dispute: IForeignGatewayDisputeData;
  isLoading: boolean;
}> = ({ dispute, isLoading }) => {
  const canReimburse = dispute.ruled && !dispute.paid.isZero();
  const { sendWithSwitch, send, state } = useContractFunction(
    "ForeignGateway",
    "withdrawFees",
    { chainId: Rinkeby.chainId }
  );
  return sendWithSwitch({
    small: true,
    text: "Reimburse",
    disabled:
      isLoading ||
      !canReimburse ||
      !["None", "Exception", "Fail"].includes(state.status),
    onClick: () => send(dispute.disputeHash),
  });
};

export default ActionButton;
