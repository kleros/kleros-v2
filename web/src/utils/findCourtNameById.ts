import { CourtTreeQuery } from "src/graphql/graphql";

export const findCourtNameById = (courtTreeData: CourtTreeQuery | undefined, courtId: string) => {
  if (!courtTreeData) return undefined;
  const traverse = (court: CourtTreeQuery["court"]): string | null | undefined => {
    if (!court) return null;
    if (court.id === courtId) return court.name;
    for (const child of court.children) {
      const found = traverse(child as CourtTreeQuery["court"]);
      if (found) return found;
    }
    return null;
  };

  return traverse(courtTreeData.court) ?? undefined;
};
