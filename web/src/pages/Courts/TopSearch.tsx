import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownCascader } from "@kleros/ui-components-library";
import { StyledSkeleton } from "components/StyledSkeleton";
import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";

const TopSearch: React.FC = () => {
  const { data } = useCourtTree();
  const navigate = useNavigate();
  const items = useMemo(() => typeof data !== "undefined" && [rootToItems(data.court)], [data]);
  return items ? (
    <DropdownCascader items={items} onSelect={(path: string) => navigate(path)} placeholder="Select Court" />
  ) : (
    <StyledSkeleton width={240} height={42} />
  );
};

interface IItem {
  label: string;
  value: string;
  children?: IItem[];
}

const rootToItems = (court: CourtTreeQuery["court"]): IItem => ({
  label: court!.name ? court!.name : "Unnamed Court",
  value: `/courts/${court!.id}`,
  children: court!.children.length > 0 ? court!.children.map((child) => rootToItems(child)) : undefined,
});

export default TopSearch;
