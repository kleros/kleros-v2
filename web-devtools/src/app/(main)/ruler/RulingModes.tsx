import React, { useCallback, useMemo, useState } from "react";

import { useAccount, usePublicClient } from "wagmi";

import { Button, Radio as RadioGroup } from "@kleros/ui-components-library";

import { RULING_MODE } from "consts";

import { DEFAULT_CHAIN } from "consts/chains";
import { useRulerContext } from "context/RulerContext";
import {
  useSimulateKlerosCoreRulerChangeRulingModeToAutomaticPreset,
  useSimulateKlerosCoreRulerChangeRulingModeToAutomaticRandom,
  useSimulateKlerosCoreRulerChangeRulingModeToManual,
  useWriteKlerosCoreRulerChangeRulingModeToAutomaticPreset,
  useWriteKlerosCoreRulerChangeRulingModeToAutomaticRandom,
  useWriteKlerosCoreRulerChangeRulingModeToManual,
} from "hooks/contracts/generated";
import { isUndefined } from "utils/isUndefined";
import { wrapWithToast } from "utils/wrapWithToast";

import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const RulingModes: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const { arbitrable, arbitrableSettings } = useRulerContext();
  const [rulingMode, setRulingMode] = useState<RULING_MODE>(RULING_MODE.Uninitialized);
  const [tie, setTie] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const [ruling, setRuling] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const publicClient = usePublicClient();

  const {
    data: manualModeConfig,
    isError: manualModeConfigError,
    isLoading: isLoadingManualConfig,
  } = useSimulateKlerosCoreRulerChangeRulingModeToManual({
    query: {
      enabled:
        rulingMode === RULING_MODE.Manual &&
        !isUndefined(arbitrable) &&
        arbitrableSettings?.rulingMode !== RULING_MODE.Manual,
    },
    args: [arbitrable as `0x${string}`],
  });
  const { writeContractAsync: changeToManualMode, isPending: isChangingToManualMode } =
    useWriteKlerosCoreRulerChangeRulingModeToManual();

  const {
    data: automaticPresetConfig,
    isError: automaticPresetConfigError,
    isLoading: isLoadingAutomaticPresetConfig,
  } = useSimulateKlerosCoreRulerChangeRulingModeToAutomaticPreset({
    query: {
      enabled:
        rulingMode === RULING_MODE.AutomaticPreset &&
        !isUndefined(arbitrable) &&
        (arbitrableSettings?.rulingMode !== RULING_MODE.AutomaticPreset ||
          arbitrableSettings?.ruling !== ruling ||
          arbitrableSettings?.tied !== tie ||
          arbitrableSettings?.overridden !== overridden),
    },
    args: [arbitrable as `0x${string}`, BigInt(ruling), tie, overridden],
  });
  const { writeContractAsync: changeToAutomaticPreset, isPending: isChangingToAutomaticPreset } =
    useWriteKlerosCoreRulerChangeRulingModeToAutomaticPreset();

  const {
    data: automaticRandomConfig,
    isError: automaticRandomConfigError,
    isLoading: isLoadingAutomaticRandomConfig,
  } = useSimulateKlerosCoreRulerChangeRulingModeToAutomaticRandom({
    query: {
      enabled:
        rulingMode === RULING_MODE.AutomaticRandom &&
        !isUndefined(arbitrable) &&
        arbitrableSettings?.rulingMode !== RULING_MODE.AutomaticRandom,
    },
    args: [arbitrable as `0x${string}`],
  });
  const { writeContractAsync: changeToAutomaticRandom, isPending: isChangingToAutomaticRandom } =
    useWriteKlerosCoreRulerChangeRulingModeToAutomaticRandom();

  const isDisabled = useMemo(() => {
    if (!arbitrable || !isConnected || chainId !== DEFAULT_CHAIN) return true;
    switch (rulingMode) {
      case RULING_MODE.Manual:
        return (
          rulingMode === arbitrableSettings?.rulingMode ||
          manualModeConfigError ||
          isChangingToManualMode ||
          isLoadingManualConfig
        );
      case RULING_MODE.AutomaticPreset:
        return (
          automaticPresetConfigError ||
          isChangingToAutomaticPreset ||
          isLoadingAutomaticPresetConfig ||
          (rulingMode === arbitrableSettings?.rulingMode &&
            arbitrableSettings?.ruling === ruling &&
            arbitrableSettings?.tied === tie &&
            arbitrableSettings?.overridden === overridden)
        );
      default:
        return (
          rulingMode === arbitrableSettings?.rulingMode ||
          automaticRandomConfigError ||
          isChangingToAutomaticRandom ||
          isLoadingAutomaticRandomConfig
        );
    }
  }, [
    arbitrable,
    rulingMode,
    manualModeConfigError,
    isChangingToManualMode,
    automaticPresetConfigError,
    isChangingToAutomaticPreset,
    automaticRandomConfigError,
    isChangingToAutomaticRandom,
    isLoadingManualConfig,
    isLoadingAutomaticRandomConfig,
    isLoadingAutomaticPresetConfig,
    arbitrableSettings,
    tie,
    overridden,
    ruling,
    isConnected,
    chainId,
  ]);

  const isLoading = useMemo(() => {
    switch (rulingMode) {
      case RULING_MODE.Manual:
        return isChangingToManualMode || isLoadingManualConfig;
      case RULING_MODE.AutomaticPreset:
        return isChangingToAutomaticPreset || isLoadingAutomaticPresetConfig;
      default:
        return isChangingToAutomaticRandom || isLoadingAutomaticRandomConfig;
    }
  }, [
    rulingMode,
    isChangingToManualMode,
    isChangingToAutomaticPreset,
    isChangingToAutomaticRandom,
    isLoadingManualConfig,
    isLoadingAutomaticRandomConfig,
    isLoadingAutomaticPresetConfig,
  ]);

  const handleUpdate = useCallback(() => {
    if (!publicClient) return;
    setIsSending(true);
    switch (rulingMode) {
      case RULING_MODE.Manual:
        if (!manualModeConfig) return;
        wrapWithToast(async () => await changeToManualMode(manualModeConfig.request), publicClient).finally(() =>
          setIsSending(false)
        );
        return;
      case RULING_MODE.AutomaticPreset:
        if (!automaticPresetConfig) return;
        wrapWithToast(async () => await changeToAutomaticPreset(automaticPresetConfig.request), publicClient).finally(
          () => setIsSending(false)
        );
        return;
      default:
        if (!automaticRandomConfig) return;
        wrapWithToast(async () => await changeToAutomaticRandom(automaticRandomConfig.request), publicClient).finally(
          () => setIsSending(false)
        );
        return;
    }
  }, [
    rulingMode,
    automaticPresetConfig,
    manualModeConfig,
    automaticRandomConfig,
    publicClient,
    changeToAutomaticPreset,
    changeToAutomaticRandom,
    changeToManualMode,
  ]);

  return (
    <div className="flex w-full flex-col gap-8">
      <Header
        text="Ruling Mode"
        tooltipMsg="Current Ruling mode of the arbitrator. Learn more about ruling modes here."
      />
      <label>
        Current mode: <small>{getRulingModeText(arbitrableSettings?.rulingMode)}</small>
      </label>
      <div className="flex w-full flex-col flex-wrap gap-4">
        <RadioGroup
          aria-label="Ruling mode"
          className="gap-4 [&_label]:leading-[18px] [&_label>span]:top-0"
          small
          value={rulingMode.toString()}
          onChange={(value) => setRulingMode(Number(value) as RULING_MODE)}
          options={[
            { value: RULING_MODE.Manual.toString(), label: "Manual" },
            { value: RULING_MODE.AutomaticRandom.toString(), label: "Random Preset" },
            { value: RULING_MODE.AutomaticPreset.toString(), label: "Automatic Preset" },
          ]}
        />
        {rulingMode === RULING_MODE.AutomaticPreset && (
          <div className="flex flex-wrap justify-around gap-4">
            <LabeledInput
              label="Ruling"
              type="number"
              value={ruling}
              onChange={(value) => setRuling(Number.isNaN(value) ? 0 : value)}
              isDisabled={rulingMode !== RULING_MODE.AutomaticPreset}
            />
            <LabeledInput
              label="Tie"
              inputType="checkbox"
              isSelected={tie}
              onChange={() => setTie((prev) => !prev)}
              isDisabled={rulingMode !== RULING_MODE.AutomaticPreset}
            />
            <LabeledInput
              label="Overridden"
              inputType="checkbox"
              isSelected={overridden}
              onChange={() => setOverridden((prev) => !prev)}
              isDisabled={rulingMode !== RULING_MODE.AutomaticPreset}
            />
          </div>
        )}
      </div>
      <Button
        text="Update"
        onClick={handleUpdate}
        isLoading={isLoading || isSending}
        isDisabled={isDisabled || isSending}
      />
    </div>
  );
};

const getRulingModeText = (mode?: RULING_MODE) => {
  if (!mode) return "Uninitialized";
  switch (mode) {
    case RULING_MODE.Manual:
      return "Manual";
    case RULING_MODE.AutomaticRandom:
      return "Automatic Random";
    case RULING_MODE.AutomaticPreset:
      return "Automatic Preset";
    default:
      return "Uninitialized";
  }
};

export default RulingModes;
