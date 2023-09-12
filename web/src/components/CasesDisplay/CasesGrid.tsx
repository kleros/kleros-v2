import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import Skeleton from "react-loading-skeleton";
import { StandardPagination } from "@kleros/ui-components-library";
import { isUndefined } from "utils/index";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
import { useCounterQuery } from "hooks/queries/useCounter";
import { useUserQuery } from "hooks/queries/useUser";
import { useFiltersContext } from "context/FilterProvider";
import DisputeCard from "components/DisputeCard";
import { CounterQuery, UserQuery } from "src/graphql/graphql";
import { useMyAppealCasesQuery } from "~src/hooks/queries/useMyAppealCasesQuery";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

const StyledSkeleton = styled(Skeleton)`
  height: 260px;
  width: 310px;
`;

// 24px as margin-top since we already have 8px from the flex gap
const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

export interface ICasesGrid {
  disputes?: DisputeDetailsFragment[];
  currentPage: number;
  setCurrentPage: (newPage: number) => void;
  numberDisputes?: number;
  casesPerPage: number;
}

const calculatePages = (
  status: number,
  data: CounterQuery | UserQuery | undefined,
  casesPerPage: number,
  numberDisputes: number,
  myAppeals?: number
) => {
  if (!data) {
    return 0;
  }

  let totalPages = 0;

  switch (status) {
    case 1:
      totalPages =
        "counter" in data
          ? data?.counter?.cases - data?.counter?.casesRuled
          : (data as UserQuery).user?.totalDisputes - (data as UserQuery).user?.totalResolvedDisputes;
      break;
    case 2:
      totalPages = "counter" in data ? data?.counter?.casesRuled : (data as UserQuery).user?.totalResolvedDisputes;
      break;
    case 3:
      totalPages = "counter" in data ? data?.counter?.casesAppealing : myAppeals ?? 0;
      break;
    default:
      totalPages = "counter" in data ? numberDisputes ?? 0 : (data as UserQuery).user?.totalDisputes ?? 0;
  }

  return totalPages / casesPerPage;
};

const CasesGrid: React.FC<ICasesGrid> = ({ disputes, currentPage, setCurrentPage, numberDisputes, casesPerPage }) => {
  const { address } = useAccount();
  const { statusFilter, debouncedSearch, filteredCases, isDashboard } = useFiltersContext();
  const { data: userData } = useUserQuery(address);
  const { data: userAppealCases } = useMyAppealCasesQuery(address);
  const { data: counterData } = useCounterQuery();
  const userAppealCasesNumber = userAppealCases?.user?.disputes.length;
  const totalPages = isDashboard
    ? calculatePages(statusFilter, userData, casesPerPage, numberDisputes ?? 0, userAppealCasesNumber)
    : calculatePages(statusFilter, counterData, casesPerPage, numberDisputes ?? 0);
  return (
    <>
      {!isUndefined(numberDisputes) && (
        <Container>
          {isUndefined(disputes) || isUndefined(filteredCases)
            ? [...Array(casesPerPage)].map((_, i) => <StyledSkeleton key={i} />)
            : disputes.map((dispute, i) => {
                return <DisputeCard key={i} {...dispute} />;
              })}
        </Container>
      )}

      {debouncedSearch === "" && (
        <StyledPagination
          currentPage={currentPage}
          numPages={Math.ceil(totalPages ?? 0)}
          callback={(page: number) => setCurrentPage(page)}
        />
      )}
    </>
  );
};

export default CasesGrid;
