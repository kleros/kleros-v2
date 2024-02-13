import { Button } from "@kleros/ui-components-library";
import React, { useState } from "react";
import { formatEther } from "viem";
import { useAccount, useNetwork, usePublicClient, useWalletClient } from "wagmi";
import { DEFAULT_CHAIN } from "consts/chains";
import { prepareWritePnkFaucet, usePnkBalanceOf, usePnkFaucetWithdrewAlready } from "hooks/contracts/generated";
import { usePNKFaucetAddress } from "hooks/useContractAddress";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

const ClaimPnkButton: React.FC = () => {
  const [isSending, setIsSending] = useState(false);
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: claimed } = usePnkFaucetWithdrewAlready({
    enabled: !isUndefined(address),
    args: [address ?? "0x00"],
    watch: true,
  });

  const faucetAddress = usePNKFaucetAddress();
  const { data: balance } = usePnkBalanceOf({
    args: [faucetAddress],
    watch: true,
  });
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleRequest = async () => {
    setIsSending(true);
    const { request } = await prepareWritePnkFaucet({
      functionName: "request",
    });
    if (walletClient) {
      wrapWithToast(async () => await walletClient.writeContract(request), publicClient).finally(() => {
        setIsSending(false);
      });
    }
  };
  const faucetCheck = !isUndefined(balance) && parseInt(formatEther(balance)) > 200;
  return chain?.id === DEFAULT_CHAIN && !claimed ? (
    <Button
      variant="primary"
      text={faucetCheck ? "Claim PNK" : "Empty Faucet"}
      onClick={handleRequest}
      isLoading={isSending}
      disabled={isSending || claimed || !faucetCheck}
    />
  ) : null;
};
export default ClaimPnkButton;
