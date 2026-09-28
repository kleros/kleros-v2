import { useAccountEffect } from "wagmi";

export const useRecordWalletConnection = () =>
  useAccountEffect({
    onConnect({ address, isReconnected }) {
      if (isReconnected) return;
      fetch("/.netlify/functions/recordConnection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, timestamp: Date.now() }),
      }).catch(console.error);
    },
  });
