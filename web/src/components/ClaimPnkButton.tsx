import React, { useState } from "react";

import { formatEther } from "viem";
import { useAccount, useNetwork, usePublicClient, useWalletClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import FaucetIcon from "svgs/icons/faucet.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import {
  prepareWritePnkFaucet,
  usePnkBalanceOf,
  usePnkFaucetAmount,
  usePnkFaucetWithdrewAlready,
} from "hooks/contracts/generated";
import { usePNKFaucetAddress } from "hooks/useContractAddress";
import { formatPNK } from "utils/format";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

import Popup, { PopupType } from "./Popup";

const ClaimPnkButton: React.FC = () => {
  const [isSending, setIsSending] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();

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
  const { data: dripAmount } = usePnkFaucetAmount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleRequest = async () => {
    setIsSending(true);
    const { request } = await prepareWritePnkFaucet({
      functionName: "request",
    });
    if (walletClient) {
      wrapWithToast(async () => await walletClient.writeContract(request), publicClient)
        .finally(() => {
          setIsSending(false);
        })
        .then(({ result, status }) => {
          setIsPopupOpen(status);
          status && setHash(result?.transactionHash);
        });
    }
  };
  const faucetCheck = !isUndefined(balance) && parseInt(formatEther(balance)) > 200;
  return (
    <>
      {chain?.id === DEFAULT_CHAIN && !claimed ? (
        <Button
          variant="primary"
          text={faucetCheck ? "Claim PNK" : "Empty Faucet"}
          onClick={handleRequest}
          isLoading={isSending}
          disabled={isSending || claimed || !faucetCheck}
          Icon={faucetCheck ? FaucetIcon : undefined}
        />
      ) : null}
      {isPopupOpen && (
        <Popup
          title="Success!"
          popupType={PopupType.SWAP_SUCCESS}
          hash={hash}
          amount={formatPNK(dripAmount ?? BigInt(0))}
          isClaim
          setIsOpen={setIsPopupOpen}
        />
      )}
    </>
  );
};
export default ClaimPnkButton;
