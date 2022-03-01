import React from "react";
import { Rinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { Button } from "@kleros/ui-components-library";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";
import { useTimeLeft } from "hooks/useTimeLeft";
import { IFastBridgeClaim } from "queries/useFastBridgeQuery";
import ETHLogo from "svgs/ethereum-eth-logo.svg";

const ActionButton: React.FC<{ claim: IFastBridgeClaim }> = ({ claim }) => {
  const isClaimed =
    claim.bridger !== "0x0000000000000000000000000000000000000000";
  return isClaimed ? (
    <ReimburseButton {...{ claim }} />
  ) : (
    <ClaimButton {...{ claim }} />
  );
};

const ClaimButton: React.FC<{ claim: IFastBridgeClaim }> = ({ claim }) => {
  const { call } =
    useContractCall("FastBridgeReceiver", "claimDeposit", Rinkeby.chainId) ||
    {};
  const { sendWithSwitch, state } = useContractFunction(
    "FastBridgeReceiver",
    "claim",
    { chainId: Rinkeby.chainId }
  );
  return (
    <Button
      small
      text="Claim"
      icon={(className: string) => <ETHLogo {...{ className }} />}
      disabled={!["None", "Exception", "Fail"].includes(state.status)}
      onClick={() =>
        call &&
        call().then((value: Result) => {
          const arbitrationCost = value.toString();
          sendWithSwitch(claim.messageHash, { value: arbitrationCost });
        })
      }
    />
  );
};

const ReimburseButton: React.FC<{ claim: IFastBridgeClaim }> = ({ claim }) => {
  const timeLeft = useTimeLeft(claim);
  const canReimburse =
    !claim.claimDeposit.isZero() && timeLeft !== undefined && timeLeft <= 0;
  const { sendWithSwitch, state } = useContractFunction(
    "FastBridgeReceiver",
    "withdrawClaimDeposit",
    { chainId: Rinkeby.chainId }
  );
  return (
    <Button
      small
      text="Reimburse"
      icon={(className: string) => <ETHLogo {...{ className }} />}
      disabled={
        !canReimburse || !["None", "Exception", "Fail"].includes(state.status)
      }
      onClick={() => {
        sendWithSwitch(claim.messageHash);
      }}
    />
  );
};

export default ActionButton;
