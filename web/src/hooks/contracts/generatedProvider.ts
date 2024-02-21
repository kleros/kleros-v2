import { isUniversityCourt } from "consts/index";
import {
  klerosCoreABI as klerosCoreVanillaABI,
  klerosCoreUniversityABI,
  getKlerosCore as getKlerosCoreVanilla,
  getKlerosCoreUniversity,
  getDisputeKitClassic as getDisputeKitClassicVanilla,
  getDisputeKitClassicUniversity,
  usePrepareKlerosCoreSetStake as usePrepareKlerosCoreVanillaSetStake,
  usePrepareKlerosCoreUniversitySetStake,
  useKlerosCoreSetStake as useKlerosCoreVanillaSetStake,
  useKlerosCoreUniversitySetStake,
  useKlerosCoreArbitrationCost as useKlerosCoreVanillaArbitrationCost,
  useKlerosCoreUniversityArbitrationCost,
  useSortitionModulePhase as useSortitionModuleVanillaPhase,
  useSortitionModuleGetJurorBalance as useSortitionModuleVanillaGetJurorBalance,
  useSortitionModuleUniversityGetJurorBalance,
  useKlerosCoreCurrentRuling as useKlerosCoreVanillaCurrentRuling,
  useKlerosCoreUniversityCurrentRuling,
  useDisputeKitClassicIsVoteActive as useDisputeKitClassicVanillaIsVoteActive,
  useDisputeKitClassicUniversityIsVoteActive,
  usePrepareDisputeKitClassicFundAppeal as usePrepareDisputeKitClassicVanillaFundAppeal,
  usePrepareDisputeKitClassicUniversityFundAppeal,
  useDisputeKitClassicFundAppeal as useDisputeKitClassicVanillaFundAppeal,
  useDisputeKitClassicUniversityFundAppeal,
  prepareWriteDisputeKitClassic as prepareWriteDisputeKitClassicVanilla,
  prepareWriteDisputeKitClassicUniversity,
  usePrepareDisputeResolverCreateDisputeForTemplate as usePrepareDisputeResolverVanillaCreateDisputeForTemplate,
  usePrepareDisputeResolverUniversityCreateDisputeForTemplate,
  useDisputeResolverCreateDisputeForTemplate as useDisputeResolverVanillaCreateDisputeForTemplate,
  useDisputeResolverUniversityCreateDisputeForTemplate,
} from "hooks/contracts/generated";

const provide = (vanillaVersion, universityVersion) => (isUniversityCourt() ? universityVersion : vanillaVersion);

export const klerosCoreABI = provide(klerosCoreVanillaABI, klerosCoreUniversityABI);

export const getKlerosCore = provide(getKlerosCoreVanilla, getKlerosCoreUniversity);

export const getDisputeKitClassic = provide(getDisputeKitClassicVanilla, getDisputeKitClassicUniversity);

export const usePrepareKlerosCoreSetStake = provide(
  usePrepareKlerosCoreVanillaSetStake,
  usePrepareKlerosCoreUniversitySetStake
);

export const useKlerosCoreSetStake = provide(useKlerosCoreVanillaSetStake, useKlerosCoreUniversitySetStake);

export const useKlerosCoreArbitrationCost = provide(
  useKlerosCoreVanillaArbitrationCost,
  useKlerosCoreUniversityArbitrationCost
);

export const useSortitionModulePhase = provide(useSortitionModuleVanillaPhase, undefined);

export const useSortitionModuleGetJurorBalance = provide(
  useSortitionModuleVanillaGetJurorBalance,
  useSortitionModuleUniversityGetJurorBalance
);

export const useKlerosCoreCurrentRuling = provide(
  useKlerosCoreVanillaCurrentRuling,
  useKlerosCoreUniversityCurrentRuling
);

export const useDisputeKitClassicIsVoteActive = provide(
  useDisputeKitClassicVanillaIsVoteActive,
  useDisputeKitClassicUniversityIsVoteActive
);

export const usePrepareDisputeKitClassicFundAppeal = provide(
  usePrepareDisputeKitClassicVanillaFundAppeal,
  usePrepareDisputeKitClassicUniversityFundAppeal
);

export const useDisputeKitClassicFundAppeal = provide(
  useDisputeKitClassicVanillaFundAppeal,
  useDisputeKitClassicUniversityFundAppeal
);

export const prepareWriteDisputeKitClassic = provide(
  prepareWriteDisputeKitClassicVanilla,
  prepareWriteDisputeKitClassicUniversity
);

export const usePrepareDisputeResolverCreateDisputeForTemplate = provide(
  usePrepareDisputeResolverVanillaCreateDisputeForTemplate,
  usePrepareDisputeResolverUniversityCreateDisputeForTemplate
);

export const useDisputeResolverCreateDisputeForTemplate = provide(
  useDisputeResolverVanillaCreateDisputeForTemplate,
  useDisputeResolverUniversityCreateDisputeForTemplate
);
