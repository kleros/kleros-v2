import React from "react";
import { Rinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { Button } from "@kleros/ui-components-library";
import { useContractFunction } from "hooks/useContractFunction";
import { useContractCall } from "hooks/useContractCall";
import {
  IFastBridgeClaim,
  useFastBridgeChallengeDurationQuery,
} from "queries/useFastBridgeQuery";

const ActionButton: React.FC<{ claim: IFastBridgeClaim }> = ({ claim }) => {
  const isClaimed = claim.bridger !== "0x0000000000000000000000000000000000000";
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
      disabled={
        !["None", "Exception", "Success", "Fail"].includes(state.status)
      }
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
  const { data: challengeDuration } = useFastBridgeChallengeDurationQuery();
  const canReimburse =
    challengeDuration &&
    !claim.claimDeposit.isZero() &&
    claim.claimedAt.toNumber() + challengeDuration.toNumber() < Date.now();
  const { sendWithSwitch, state } = useContractFunction(
    "FastBridgeReceiver",
    "withdrawClaimDeposit",
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
        sendWithSwitch(claim.messageHash);
      }}
    />
  );
};

export default ActionButton;
