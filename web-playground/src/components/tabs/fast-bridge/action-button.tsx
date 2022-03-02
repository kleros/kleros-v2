import React from "react";
import { Rinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";
import { useTimeLeft } from "hooks/useTimeLeft";
import { IFastBridgeClaim } from "queries/useFastBridgeQuery";

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
  const { sendWithSwitch, send, state } = useContractFunction(
    "FastBridgeReceiver",
    "claim",
    { chainId: Rinkeby.chainId }
  );
  return sendWithSwitch({
    small: true,
    text: "Claim",
    disabled: !["None", "Exception", "Fail"].includes(state.status),
    onClick: () =>
      call &&
      call().then((value: Result) => {
        const arbitrationCost = value.toString();
        send(claim.messageHash, { value: arbitrationCost });
      }),
  });
};

const ReimburseButton: React.FC<{ claim: IFastBridgeClaim }> = ({ claim }) => {
  const timeLeft = useTimeLeft(claim);
  const canReimburse =
    !claim.claimDeposit.isZero() && timeLeft !== undefined && timeLeft <= 0;
  const { sendWithSwitch, send, state } = useContractFunction(
    "FastBridgeReceiver",
    "withdrawClaimDeposit",
    { chainId: Rinkeby.chainId }
  );
  return sendWithSwitch({
    small: true,
    text: "Reimburse",
    disabled:
      !canReimburse || !["None", "Exception", "Fail"].includes(state.status),
    onClick: () => send(claim.messageHash),
  });
};

export default ActionButton;
