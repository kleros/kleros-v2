import { useReadSortitionModule } from "hooks/contracts/generated";

export const useSortitionModulePhase = () => {
  // eslint-disable-next-line
  // @ts-ignore
  return useReadSortitionModule({ functionName: "phase" });
};
