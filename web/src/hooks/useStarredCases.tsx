import { useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage";

const useStarredCases = () => {
  const initialValue = new Map<string, boolean>();

  const [localStarredCases, setLocalStarredCases] = useLocalStorage("starredCases", Array.from(initialValue));

  const starredCases = useMemo(() => new Map<string, boolean>(localStarredCases), [localStarredCases]);
  const starredCaseIds = Array.from(starredCases.keys());

  const starCase = (id: string) => {
    if (starredCases.get(id)) starredCases.delete(id);
    else starredCases.set(id, true);

    setLocalStarredCases(Array.from(starredCases));
  };

  const clearAll = () => {
    setLocalStarredCases(Array.from(initialValue));
  };
  return { starredCases, starredCaseIds, starCase, clearAll };
};

export default useStarredCases;
