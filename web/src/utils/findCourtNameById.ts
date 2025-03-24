import { CourtTreeQuery } from "src/graphql/graphql";

export const findCourtNameById = (courtTreeData: CourtTreeQuery, courtId: string) => {
  const traverse = (court: CourtTreeQuery["court"]) => {
    if (court.id === courtId) return court.name;
    for (const child of court.children) {
      const found = traverse(child);
      if (found) return found;
    }
    return null;
  };

  return traverse(courtTreeData.court) ?? undefined;
};
