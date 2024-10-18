import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { RULING_MODE } from "consts";
import { Address, isAddress } from "viem";

import { useReadKlerosCoreRulerRulers, useReadKlerosCoreRulerSettings } from "hooks/contracts/generated";
import { useLocalStorage } from "hooks/useLocalStorage";
import { isUndefined } from "utils/isUndefined";

const REFETCH_INTERVAL = 5000;

type ArbitrableSettings = {
  rulingMode: RULING_MODE;
  ruling: number;
  tied: boolean;
  overridden: boolean;
};

interface IRulerContext {
  arbitrable?: Address;
  setArbitrable: (arbitrable: Address) => void;
  arbitrableSettings?: ArbitrableSettings;
  currentDeveloper?: Address;
  refetchData: () => void;
  knownArbitrables: string[];
}
const RulerContext = createContext<IRulerContext | undefined>(undefined);

const RulerContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [arbitrable, setArbitrable] = useState<Address>();
  const [arbitrableSettings, setArbitrableSettings] = useState<ArbitrableSettings>();
  const [knownArbitrables, setKnownArbitrables] = useLocalStorage<string[]>("knownArbitrables", []);

  const { data: currentDeveloper, refetch: refetchDeveloper } = useReadKlerosCoreRulerRulers({
    query: {
      enabled: !isUndefined(arbitrable),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [(arbitrable ?? "") as `0x${string}`],
  });

  const { data: arbitrableSettingsData, refetch: refetchArbitrableSettings } = useReadKlerosCoreRulerSettings({
    query: {
      enabled: !isUndefined(arbitrable),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [(arbitrable ?? "") as `0x${string}`],
  });

  useEffect(() => {
    if (!arbitrableSettingsData) return;
    const [rulingMode, rulingRaw, tied, overridden] = arbitrableSettingsData;
    setArbitrableSettings({
      rulingMode,
      ruling: Number(rulingRaw),
      tied,
      overridden,
    });
  }, [arbitrableSettingsData]);

  useEffect(() => {
    if (isUndefined(arbitrable) || !isAddress(arbitrable) || knownArbitrables.includes(arbitrable?.toLowerCase()))
      return;

    setKnownArbitrables([...knownArbitrables, arbitrable?.toLowerCase()]);
  }, [arbitrable, knownArbitrables]);

  const refetchData = useCallback(() => {
    refetchArbitrableSettings();
    refetchDeveloper();
  }, [refetchArbitrableSettings, refetchDeveloper]);

  return (
    <RulerContext.Provider
      value={useMemo(
        () => ({
          arbitrable,
          setArbitrable,
          arbitrableSettings,
          currentDeveloper,
          refetchData,
          knownArbitrables,
        }),
        [arbitrable, arbitrableSettings, currentDeveloper, refetchData, knownArbitrables]
      )}
    >
      {children}
    </RulerContext.Provider>
  );
};

export const useRulerContext = () => {
  const context = useContext(RulerContext);
  if (!context) {
    throw new Error("Context Provider not found.");
  }
  return context;
};

export default RulerContextProvider;
