import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { DropdownSelect } from "@kleros/ui-components-library";

import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

import Stats, { IStats } from "./Stats";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${responsiveSize(12, 13)};
  margin-bottom: ${responsiveSize(16, 32)};
  justify-content: space-between;
`;

const StatsAndFilters: React.FC<IStats> = ({ totalJurors }) => {
  const navigate = useNavigate();
  const { order, filter } = useParams();
  const location = useRootPath();
  const { ...filterObject } = decodeURIFilter(filter ?? "all");
  const [searchParams] = useSearchParams();

  const handleOrderChange = (value: string | number) => {
    const encodedFilter = encodeURIFilter({ ...filterObject });
    navigate(`${location}/1/${value}/${encodedFilter}?${searchParams.toString()}`);
  };

  return (
    <Container>
      <Stats {...{ totalJurors }} />
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: "desc", text: "1st to last" },
          { value: "asc", text: "Last to 1st" },
        ]}
        defaultValue={order}
        callback={handleOrderChange}
      />
    </Container>
  );
};

export default StatsAndFilters;
