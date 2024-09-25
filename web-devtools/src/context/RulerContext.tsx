import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { RULING_MODE } from "consts";
import { Address } from "viem";
import { useAccount } from "wagmi";

import { useReadKlerosCoreRulerRulers, useReadKlerosCoreRulerSettings } from "hooks/contracts/generated";
import { isUndefined } from "utils/isUndefined";

const REFETCH_INTERVAL = 5000;

type ArbitrableSettings = {
  rulingMode: RULING_MODE;
  ruling: number;
  tied: boolean;
  overidden: boolean;
};

interface IRulerContext {
  arbitrable?: Address;
  setArbitrable: (arbitrable: Address) => void;
  arbitrableSettings?: ArbitrableSettings;
  currentDeveloper?: Address;
  isRulerOfArbitrable: boolean;
  refetchData: () => void;
}
const RulerContext = createContext<IRulerContext | undefined>(undefined);

const RulerContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [arbitrable, setArbitrable] = useState<Address>();
  const [arbitrableSettings, setArbitrableSettings] = useState<ArbitrableSettings>();
  const { address } = useAccount();

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
    setArbitrableSettings({
      rulingMode: arbitrableSettingsData[0],
      ruling: Number(arbitrableSettingsData[1]),
      tied: arbitrableSettingsData[2],
      overidden: arbitrableSettingsData[3],
    });
  }, [arbitrableSettingsData]);

  const refetchData = useCallback(() => {
    refetchArbitrableSettings();
    refetchDeveloper();
  }, [refetchArbitrableSettings, refetchDeveloper]);

  const isRulerOfArbitrable = useMemo(() => address === currentDeveloper, [address, currentDeveloper]);

  return (
    <RulerContext.Provider
      value={useMemo(
        () => ({
          arbitrable,
          setArbitrable,
          arbitrableSettings,
          currentDeveloper,
          refetchData,
          isRulerOfArbitrable,
        }),
        [arbitrable, setArbitrable, arbitrableSettings, currentDeveloper, refetchData, isRulerOfArbitrable]
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
