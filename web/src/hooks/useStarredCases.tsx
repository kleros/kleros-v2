import { useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage";

const useStarredCases = () => {
  const initialValue = new Set<string>();

  const [localStarredCases, setLocalStarredCases] = useLocalStorage("starredCases", Array.from(initialValue));

  const starredCases = useMemo(() => new Set<string>(localStarredCases), [localStarredCases]);
  const starredCaseIds = Array.from(starredCases.keys());

  const starCase = (id: string) => {
    if (starredCases.has(id)) starredCases.delete(id);
    else starredCases.add(id);

    setLocalStarredCases(Array.from(starredCases));
  };

  const clearAll = () => {
    setLocalStarredCases(Array.from(initialValue));
  };
  return { starredCases, starredCaseIds, starCase, clearAll };
};

export default useStarredCases;
