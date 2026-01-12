import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { formatEther } from "viem";
import { useAccount, useChainId, usePublicClient, useWalletClient, useConfig } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import FaucetIcon from "svgs/icons/faucet.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { REFETCH_INTERVAL } from "consts/index";
import {
  simulatePnkFaucet,
  useReadPnkBalanceOf,
  useReadPnkFaucetAmount,
  useReadPnkFaucetWithdrewAlready,
  pnkFaucetAddress,
} from "hooks/contracts/generated";
import { formatPNK } from "utils/format";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

import Popup, { PopupType } from "./Popup";

const ClaimPnkButton: React.FC = () => {
  const { t } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();

  const chainId = useChainId();
  const { address } = useAccount();
  const { data: claimed } = useReadPnkFaucetWithdrewAlready({
    query: {
      enabled: !isUndefined(address),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [address ?? "0x00"],
  });

  const faucetAddress = pnkFaucetAddress[chainId];
  const { data: balance } = useReadPnkBalanceOf({
    args: [faucetAddress],
  });
  const { data: dripAmount } = useReadPnkFaucetAmount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const wagmiConfig = useConfig();

  const handleRequest = async () => {
    setIsSending(true);
    const { request } = await simulatePnkFaucet(wagmiConfig, {
      functionName: "request",
    });
    if (walletClient && publicClient) {
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
      {chainId === DEFAULT_CHAIN && !claimed ? (
        <Button
          variant="primary"
          text={faucetCheck ? t("buttons.claim_pnk") : t("buttons.empty_faucet")}
          onClick={handleRequest}
          isLoading={isSending}
          disabled={isSending || claimed || !faucetCheck || isUndefined(address)}
          Icon={faucetCheck ? FaucetIcon : undefined}
        />
      ) : null}
      {isPopupOpen && (
        <Popup
          title={t("popups.success")}
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
