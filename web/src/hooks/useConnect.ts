import { useEffect, useState } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { injected } from "connectors/injected";

export const useConnect = () => {
  const { activate, error } = useWeb3React();
  const [connecting, setConnecting] = useState(false);
  const [activationError, setActivationError] = useState<Error>();

  const activateInjected = () => {
    setConnecting(true);
    activate(injected, undefined, true)
      .catch((error) => setActivationError(error))
      .finally(() => setConnecting(false));
  };

  const activateInjectedWithAccountsCheck = (accounts: string[]) =>
    accounts.length > 0 && activateInjected();

  useEffect(() => {
    const { ethereum } = window as any;
    if (ethereum && ethereum.on) {
      ethereum.on("chainChanged", activateInjected);
      ethereum.on("accountsChanged", activateInjectedWithAccountsCheck);
      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", activateInjected);
          ethereum.removeListener(
            "accountsChanged",
            activateInjectedWithAccountsCheck
          );
        }
      };
    } else return;
  });

  useEffect(() => {
    if (
      activationError &&
      activationError.name === UnsupportedChainIdError.name
    )
      throw activationError;
  }, [activationError]);

  return { activate: activateInjected, connecting, error };
};
