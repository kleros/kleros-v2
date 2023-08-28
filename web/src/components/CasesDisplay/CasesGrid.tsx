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
import { CounterQuery, Period, UserQuery } from "~src/graphql/graphql";
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
  data: CounterQuery | UserQuery,
  casesPerPage: number,
  numberDisputes: number,
  myAppeals?: number
) => {
  if (data) {
    console.log("dataaa", data);
    if ("counter" in data) {
      switch (status) {
        case 1:
          return Math.ceil((data?.counter?.cases - data?.counter?.casesRuled) / casesPerPage);
        case 2:
          return Math.ceil(data?.counter?.casesRuled / casesPerPage);
        case 3:
          return Math.ceil(data?.counter?.casesAppealing / casesPerPage);
        default:
          return Math.ceil((numberDisputes ?? 0) / casesPerPage);
      }
    } else {
      const userQueryData = data as UserQuery;
      switch (status) {
        case 1:
          return Math.ceil(
            (userQueryData?.user?.totalDisputes - userQueryData?.user?.totalResolvedDisputes) / casesPerPage
          );
        case 2:
          return Math.ceil(userQueryData?.user?.totalResolvedDisputes / casesPerPage);
        case 3:
          return Math.ceil(myAppeals! / casesPerPage);
        default:
          return Math.ceil((userQueryData.user?.totalDisputes ?? 0) / casesPerPage);
      }
    }
  } else {
    return 0;
  }
};

const CasesGrid: React.FC<ICasesGrid> = ({ disputes, currentPage, setCurrentPage, numberDisputes, casesPerPage }) => {
  const { address } = useAccount();
  const { statusFilter, debouncedSearch, filteredCases, isDashboard } = useFiltersContext();
  const { data: userData } = useUserQuery(address);
  const { data: userAppealCases } = useMyAppealCasesQuery(address);
  const { data: counterData } = useCounterQuery();
  const userAppealCasesNumber = userAppealCases?.user?.disputes.length;
  const totalPages = isDashboard
    ? calculatePages(statusFilter, userData!, casesPerPage, numberDisputes!, userAppealCasesNumber)
    : calculatePages(statusFilter, counterData!, casesPerPage, numberDisputes!);
  console.log(
    "🚀 ~ file: CasesGrid.tsx:42 ~ counterData:",
    statusFilter,
    userData!,
    casesPerPage,
    numberDisputes!,
    userAppealCasesNumber
  );

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
          numPages={totalPages}
          callback={(page: number) => setCurrentPage(page)}
        />
      )}
    </>
  );
};

export default CasesGrid;
