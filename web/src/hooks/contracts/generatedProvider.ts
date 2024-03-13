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

const provide = (vanillaVersion, universityVersion, neoVersion) => {
  switch (whichCourt()) {
    case COURTS.vainilla:
      return vanillaVersion;
    case COURTS.university:
      return universityVersion;
    case COURTS.neo:
      return neoVersion;
  }
};

export const klerosCoreABI = provide(klerosCoreVanillaABI, klerosCoreUniversityABI, klerosCoreNeoABI);

export const getKlerosCore = provide(getKlerosCoreVanilla, getKlerosCoreUniversity, getKlerosCoreNeo);

export const getDisputeKitClassic = provide(
  getDisputeKitClassicVanilla,
  getDisputeKitClassicUniversity,
  getDisputeKitClassicNeo
);

export const usePrepareKlerosCoreSetStake = provide(
  usePrepareKlerosCoreVanillaSetStake,
  usePrepareKlerosCoreUniversitySetStake,
  usePrepareKlerosCoreNeoSetStake
);

export const useKlerosCoreSetStake = provide(
  useKlerosCoreVanillaSetStake,
  useKlerosCoreUniversitySetStake,
  useKlerosCoreNeoSetStake
);

export const useKlerosCoreArbitrationCost = provide(
  useKlerosCoreVanillaArbitrationCost,
  useKlerosCoreUniversityArbitrationCost,
  useKlerosCoreNeoArbitrationCost
);

export const useSortitionModulePhase = provide(useSortitionModuleVanillaPhase, undefined, undefined);

export const useSortitionModuleGetJurorBalance = provide(
  useSortitionModuleVanillaGetJurorBalance,
  useSortitionModuleUniversityGetJurorBalance,
  useSortitionModuleNeoGetJurorBalance
);

export const useKlerosCoreCurrentRuling = provide(
  useKlerosCoreVanillaCurrentRuling,
  useKlerosCoreUniversityCurrentRuling,
  useKlerosCoreNeoCurrentRuling
);

export const useDisputeKitClassicIsVoteActive = provide(
  useDisputeKitClassicVanillaIsVoteActive,
  useDisputeKitClassicUniversityIsVoteActive,
  useDisputeKitClassicNeoIsVoteActive
);

export const usePrepareDisputeKitClassicFundAppeal = provide(
  usePrepareDisputeKitClassicVanillaFundAppeal,
  usePrepareDisputeKitClassicUniversityFundAppeal,
  usePrepareDisputeKitClassicNeoFundAppeal
);

export const useDisputeKitClassicFundAppeal = provide(
  useDisputeKitClassicVanillaFundAppeal,
  useDisputeKitClassicUniversityFundAppeal,
  useDisputeKitClassicNeoFundAppeal
);

export const prepareWriteDisputeKitClassic = provide(
  prepareWriteDisputeKitClassicVanilla,
  prepareWriteDisputeKitClassicUniversity,
  prepareWriteDisputeKitClassicNeo
);

export const usePrepareDisputeResolverCreateDisputeForTemplate = provide(
  usePrepareDisputeResolverVanillaCreateDisputeForTemplate,
  usePrepareDisputeResolverUniversityCreateDisputeForTemplate,
  usePrepareDisputeResolverNeoCreateDisputeForTemplate
);

export const useDisputeResolverCreateDisputeForTemplate = provide(
  useDisputeResolverVanillaCreateDisputeForTemplate,
  useDisputeResolverUniversityCreateDisputeForTemplate,
  useDisputeResolverNeoCreateDisputeForTemplate
);
