import { useCallback } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useDisconnect } from "wagmi";

/**
 * Ends the Privy session and drops the wagmi connection.
 * Disconnecting wagmi alone leaves Privy authenticated, which makes a later `login()` a no-op.
 */
export const useLogout = () => {
  const { logout } = usePrivy();
  const { disconnectAsync } = useDisconnect();

  // Privy's logout does not always drop the wagmi connection, so disconnect explicitly.
  return useCallback(async () => {
    await logout();
    await disconnectAsync().catch(console.error);
  }, [logout, disconnectAsync]);
};
