import React from "react";
import { Rinkeby, ArbitrumRinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { Button } from "@kleros/ui-components-library";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";
import { IForeignGatewayDisputeData } from "queries/useForeignGatewayDisputeQuery";
import ArbitrumLogo from "svgs/arbitrum_opacity.svg";
import ETHLogo from "svgs/ethereum-eth-logo.svg";

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
  const { sendWithSwitch, state } = useContractFunction(
    "HomeGateway",
    "relayCreateDispute",
    { chainId: ArbitrumRinkeby.chainId }
  );
  return (
    <Button
      small
      text="Relay"
      icon={(className: string) => <ArbitrumLogo {...{ className }} />}
      disabled={
        isLoading || !["None", "Exception", "Fail"].includes(state.status)
      }
      onClick={() =>
        call &&
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

const ReimburseButton: React.FC<{
  dispute: IForeignGatewayDisputeData;
  isLoading: boolean;
}> = ({ dispute, isLoading }) => {
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
      icon={(className: string) => <ETHLogo {...{ className }} />}
      disabled={
        isLoading ||
        !canReimburse ||
        !["None", "Exception", "Fail"].includes(state.status)
      }
      onClick={() => {
        sendWithSwitch(dispute.disputeHash);
      }}
    />
  );
};

export default ActionButton;
