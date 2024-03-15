import { useSortitionModuleRead } from "hooks/contracts/generated";

export const useSortitionModulePhase = () => {
  // eslint-disable-next-line
  // @ts-ignore
  return useSortitionModuleRead({ functionName: "phase", watch: true });
};
