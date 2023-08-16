import { useQuery } from "@tanstack/react-query";
import { getSortitionModule } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const usePhase = () => {
  const sortitionModule = getSortitionModule({});
  const isEnabled = !isUndefined(sortitionModule);
  return useQuery({
    queryKey: [`Phase`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!sortitionModule) return;
      return await sortitionModule.read.phase();
    },
  });
};
