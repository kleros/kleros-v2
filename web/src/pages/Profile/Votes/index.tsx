import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import { StandardPagination } from "@kleros/ui-components-library";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useRootPath } from "utils/uri";

import StatsAndFilters from "./StatsAndFilters";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${responsiveSize(24, 32)};
  gap: 20px;
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
  font-size: ${responsiveSize(20, 24)};
`;

const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

interface IVotes {
  searchParamAddress: `0x${string}`;
}

const Votes: React.FC<IVotes> = ({ searchParamAddress }) => {
  const { page, order, filter } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const votesPerPage = 5;
  const location = useRootPath();
  const totalPages = 20; //TODO, HARDCODED FOR NOW
  const currentPage = parseInt(page ?? "1");

  const handlePageChange = (newPage: number) => {
    navigate(`${location}/${newPage}/${order}/${filter}?${searchParams.toString()}`);
  };

  return (
    <Container>
      <StyledTitle>Votes</StyledTitle>
      <StatsAndFilters totalVotes={10} votesPending={1} resolvedVotes={5} />
      <StyledPagination currentPage={currentPage} numPages={totalPages} callback={handlePageChange} />
    </Container>
  );
};

export default Votes;
