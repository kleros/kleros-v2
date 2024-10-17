import React, { useMemo } from "react";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";

import { DropdownCascader } from "@kleros/ui-components-library";

import { isUndefined } from "utils/index";

import { useCourtTree, rootCourtToItems } from "queries/useCourtTree";

import { responsiveSize } from "styles/responsiveSize";

import { StyledSkeleton } from "components/StyledSkeleton";

import StakeMaintenanceButtons from "./StakeMaintenanceButton";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledDropdownCascader = styled(DropdownCascader)`
  width: ${responsiveSize(200, 240)};
  > button {
    width: 100%;
  }
`;

const TopSearch: React.FC = () => {
  const { data } = useCourtTree();
  const navigate = useNavigate();
  const items = useMemo(() => !isUndefined(data) && [rootCourtToItems(data.court)], [data]);
  return (
    <Container>
      {items ? (
        <StyledDropdownCascader
          items={items}
          onSelect={(path: string | number) => navigate(path.toString())}
          placeholder="Select Court"
        />
      ) : (
        <StyledSkeleton width={240} height={42} />
      )}
      <StakeMaintenanceButtons />
    </Container>
  );
};

export default TopSearch;
