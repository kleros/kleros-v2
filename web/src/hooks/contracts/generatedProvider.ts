import { COURTS, whichCourt } from "consts/index";
import {
  klerosCoreABI as klerosCoreVanillaABI,
  klerosCoreUniversityABI,
  klerosCoreNeoABI,
  getKlerosCore as getKlerosCoreVanilla,
  getKlerosCoreUniversity,
  getKlerosCoreNeo,
  getDisputeKitClassic as getDisputeKitClassicVanilla,
  getDisputeKitClassicUniversity,
  getDisputeKitClassicNeo,
  usePrepareKlerosCoreSetStake as usePrepareKlerosCoreVanillaSetStake,
  usePrepareKlerosCoreUniversitySetStake,
  usePrepareKlerosCoreNeoSetStake,
  useKlerosCoreSetStake as useKlerosCoreVanillaSetStake,
  useKlerosCoreUniversitySetStake,
  useKlerosCoreNeoSetStake,
  useKlerosCoreArbitrationCost as useKlerosCoreVanillaArbitrationCost,
  useKlerosCoreUniversityArbitrationCost,
  useKlerosCoreNeoArbitrationCost,
  useSortitionModulePhase as useSortitionModuleVanillaPhase,
  useSortitionModuleNeoPhase,
  useSortitionModuleGetJurorBalance as useSortitionModuleVanillaGetJurorBalance,
  useSortitionModuleUniversityGetJurorBalance,
  useSortitionModuleNeoGetJurorBalance,
  useKlerosCoreCurrentRuling as useKlerosCoreVanillaCurrentRuling,
  useKlerosCoreUniversityCurrentRuling,
  useKlerosCoreNeoCurrentRuling,
  useDisputeKitClassicIsVoteActive as useDisputeKitClassicVanillaIsVoteActive,
  useDisputeKitClassicUniversityIsVoteActive,
  useDisputeKitClassicNeoIsVoteActive,
  usePrepareDisputeKitClassicFundAppeal as usePrepareDisputeKitClassicVanillaFundAppeal,
  usePrepareDisputeKitClassicUniversityFundAppeal,
  usePrepareDisputeKitClassicNeoFundAppeal,
  useDisputeKitClassicFundAppeal as useDisputeKitClassicVanillaFundAppeal,
  useDisputeKitClassicUniversityFundAppeal,
  useDisputeKitClassicNeoFundAppeal,
  prepareWriteDisputeKitClassic as prepareWriteDisputeKitClassicVanilla,
  prepareWriteDisputeKitClassicUniversity,
  prepareWriteDisputeKitClassicNeo,
  usePrepareDisputeResolverCreateDisputeForTemplate as usePrepareDisputeResolverVanillaCreateDisputeForTemplate,
  usePrepareDisputeResolverUniversityCreateDisputeForTemplate,
  usePrepareDisputeResolverNeoCreateDisputeForTemplate,
  useDisputeResolverCreateDisputeForTemplate as useDisputeResolverVanillaCreateDisputeForTemplate,
  useDisputeResolverUniversityCreateDisputeForTemplate,
  useDisputeResolverNeoCreateDisputeForTemplate,
} from "hooks/contracts/generated";

const provide = <T>(vanillaVersion, universityVersion, neoVersion): T => {
  switch (whichCourt()) {
    case COURTS.vanilla:
      return vanillaVersion;
    case COURTS.university:
      return universityVersion;
    case COURTS.neo:
      return neoVersion;
  }
};

export const klerosCoreABI = provide<typeof klerosCoreVanillaABI>(
  klerosCoreVanillaABI,
  klerosCoreUniversityABI,
  klerosCoreNeoABI
);

export const getKlerosCore = provide<typeof getKlerosCoreVanilla>(
  getKlerosCoreVanilla,
  getKlerosCoreUniversity,
  getKlerosCoreNeo
);

export const getDisputeKitClassic = provide<typeof getDisputeKitClassicVanilla>(
  getDisputeKitClassicVanilla,
  getDisputeKitClassicUniversity,
  getDisputeKitClassicNeo
);

export const usePrepareKlerosCoreSetStake = provide<typeof usePrepareKlerosCoreVanillaSetStake>(
  usePrepareKlerosCoreVanillaSetStake,
  usePrepareKlerosCoreUniversitySetStake,
  usePrepareKlerosCoreNeoSetStake
);

export const useKlerosCoreSetStake = provide<typeof useKlerosCoreVanillaSetStake>(
  useKlerosCoreVanillaSetStake,
  useKlerosCoreUniversitySetStake,
  useKlerosCoreNeoSetStake
);

export const useKlerosCoreArbitrationCost = provide<typeof useKlerosCoreVanillaArbitrationCost>(
  useKlerosCoreVanillaArbitrationCost,
  useKlerosCoreUniversityArbitrationCost,
  useKlerosCoreNeoArbitrationCost
);

export const useSortitionModulePhase = provide<typeof useSortitionModuleVanillaPhase>(
  useSortitionModuleVanillaPhase,
  undefined,
  useSortitionModuleNeoPhase
);

export const useSortitionModuleGetJurorBalance = provide<typeof useSortitionModuleVanillaGetJurorBalance>(
  useSortitionModuleVanillaGetJurorBalance,
  useSortitionModuleUniversityGetJurorBalance,
  useSortitionModuleNeoGetJurorBalance
);

export const useKlerosCoreCurrentRuling = provide<typeof useKlerosCoreVanillaCurrentRuling>(
  useKlerosCoreVanillaCurrentRuling,
  useKlerosCoreUniversityCurrentRuling,
  useKlerosCoreNeoCurrentRuling
);

export const useDisputeKitClassicIsVoteActive = provide<typeof useDisputeKitClassicVanillaIsVoteActive>(
  useDisputeKitClassicVanillaIsVoteActive,
  useDisputeKitClassicUniversityIsVoteActive,
  useDisputeKitClassicNeoIsVoteActive
);

export const usePrepareDisputeKitClassicFundAppeal = provide<typeof usePrepareDisputeKitClassicVanillaFundAppeal>(
  usePrepareDisputeKitClassicVanillaFundAppeal,
  usePrepareDisputeKitClassicUniversityFundAppeal,
  usePrepareDisputeKitClassicNeoFundAppeal
);

export const useDisputeKitClassicFundAppeal = provide<typeof useDisputeKitClassicVanillaFundAppeal>(
  useDisputeKitClassicVanillaFundAppeal,
  useDisputeKitClassicUniversityFundAppeal,
  useDisputeKitClassicNeoFundAppeal
);

export const prepareWriteDisputeKitClassic = provide<typeof prepareWriteDisputeKitClassicVanilla>(
  prepareWriteDisputeKitClassicVanilla,
  prepareWriteDisputeKitClassicUniversity,
  prepareWriteDisputeKitClassicNeo
);

export const usePrepareDisputeResolverCreateDisputeForTemplate = provide<
  typeof usePrepareDisputeResolverVanillaCreateDisputeForTemplate
>(
  usePrepareDisputeResolverVanillaCreateDisputeForTemplate,
  usePrepareDisputeResolverUniversityCreateDisputeForTemplate,
  usePrepareDisputeResolverNeoCreateDisputeForTemplate
);

export const useDisputeResolverCreateDisputeForTemplate = provide<
  typeof useDisputeResolverVanillaCreateDisputeForTemplate
>(
  useDisputeResolverVanillaCreateDisputeForTemplate,
  useDisputeResolverUniversityCreateDisputeForTemplate,
  useDisputeResolverNeoCreateDisputeForTemplate
);
