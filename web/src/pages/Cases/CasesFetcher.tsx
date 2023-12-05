import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DisputeDetailsFragment, Dispute_Filter, OrderDirection } from "src/graphql/graphql";
import { useCasesQuery } from "queries/useCasesQuery";
import { useCounterQuery, CounterQuery } from "queries/useCounter";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import useIsDesktop from "hooks/useIsDesktop";
import { isUndefined } from "utils/index";
import { decodeURIFilter, useRootPath } from "utils/uri";
import CasesDisplay from "components/CasesDisplay";

const calculateStats = (
  isCourtFilter: boolean,
  courtData: CourtDetailsQuery["court"],
  counters: CounterQuery["counter"],
  filter?: Dispute_Filter
): { totalCases: number; ruledCases: number } => {
  let totalCases: number, ruledCases: number;
  if (filter?.period === "appeal") {
    totalCases = isCourtFilter ? courtData?.numberAppealingDisputes : counters?.casesAppealing;
    ruledCases = 0;
  } else if (isUndefined(filter?.ruled)) {
    totalCases = isCourtFilter ? courtData?.numberDisputes : counters?.cases;
    ruledCases = isCourtFilter ? courtData?.numberClosedDisputes : counters?.casesRuled;
  } else if (filter?.ruled) {
    totalCases = isCourtFilter ? courtData?.numberClosedDisputes : counters?.casesRuled;
    ruledCases = totalCases;
  } else {
    totalCases = isCourtFilter
      ? courtData?.numberDisputes - courtData?.numberClosedDisputes
      : counters?.cases - counters?.casesRuled;
    ruledCases = 0;
  }
  return {
    totalCases: isNaN(totalCases) ? 0 : totalCases,
    ruledCases: isNaN(ruledCases) ? 0 : ruledCases,
  };
};

const CasesFetcher: React.FC = () => {
  const { page, order, filter } = useParams();
  const location = useRootPath();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const casesPerPage = isDesktop ? 9 : 3;
  const pageNumber = parseInt(page ?? "1");
  const disputeSkip = casesPerPage * (pageNumber - 1);
  const { data: counterData } = useCounterQuery();
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const isCourtFilter = !isUndefined(decodedFilter?.court);
  const { data: courtData } = useCourtDetails(decodedFilter?.court?.toString());
  const { data } = useCasesQuery(
    disputeSkip,
    casesPerPage,
    decodedFilter,
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc
  );
  const { totalCases, ruledCases } = useMemo(
    () => calculateStats(isCourtFilter, courtData?.court, counterData?.counter, decodedFilter),
    [isCourtFilter, courtData?.court, counterData?.counter, decodedFilter]
  );
  const totalPages = useMemo(
    () => (!isUndefined(totalCases) ? Math.ceil(totalCases / casesPerPage) : 1),
    [totalCases, casesPerPage]
  );

  return (
    <CasesDisplay
      disputes={data?.disputes as DisputeDetailsFragment[]}
      numberDisputes={totalCases}
      numberClosedDisputes={ruledCases}
      currentPage={pageNumber}
      setCurrentPage={(newPage: number) => navigate(`${location}/${newPage}/${order}/${filter}`)}
      totalPages={totalPages}
      {...{ casesPerPage }}
    />
  );
};

export default CasesFetcher;
