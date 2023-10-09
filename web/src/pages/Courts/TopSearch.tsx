import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownCascader } from "@kleros/ui-components-library";
import { StyledSkeleton } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";
import { useCourtTree, rootCourtToItems } from "queries/useCourtTree";

const TopSearch: React.FC = () => {
  const { data } = useCourtTree();
  const navigate = useNavigate();
  const items = useMemo(() => !isUndefined(data) && [rootCourtToItems(data.court)], [data]);
  return items ? (
    <DropdownCascader
      items={items}
      onSelect={(path: string | number) => navigate(path.toString())}
      placeholder="Select Court"
    />
  ) : (
    <StyledSkeleton width={240} height={42} />
  );
};

export default TopSearch;
