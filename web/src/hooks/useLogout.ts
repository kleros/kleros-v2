import { useCallback } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useDisconnect } from "wagmi";

/**
 * Ends the Privy session and drops the wagmi connection.
 * Disconnecting wagmi alone leaves an email/Google Privy session authenticated, restoring it on the next visit.
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
