import React from "react";
import { useWindowSize } from "react-use";
import { useParams, useNavigate } from "react-router-dom";
import { DisputeDetailsFragment, Dispute_Filter, OrderDirection } from "src/graphql/graphql";
import { BREAKPOINT_LANDSCAPE } from "styles/landscapeStyle";
import { useCasesQuery } from "queries/useCasesQuery";
import { useCounterQuery, CounterQuery } from "queries/useCounter";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import { decodeURIFilter, useRootPath } from "utils/uri";
import CasesDisplay from "components/CasesDisplay";
import { isUndefined } from "utils/index";

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
    totalCases = isCourtFilter ? courtData?.numberClosedDisputes : counters?.casesAppealing;
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
  const { width } = useWindowSize();
  const screenIsBig = width > BREAKPOINT_LANDSCAPE;
  const casesPerPage = screenIsBig ? 9 : 3;
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
  const { totalCases, ruledCases } = calculateStats(
    isCourtFilter,
    courtData?.court,
    counterData?.counter,
    decodedFilter
  );

  return (
    <CasesDisplay
      disputes={data?.disputes as DisputeDetailsFragment[]}
      numberDisputes={totalCases}
      numberClosedDisputes={ruledCases}
      currentPage={pageNumber}
      setCurrentPage={(newPage: number) => navigate(`${location}/${newPage}/${order}/${filter}`)}
      totalPages={!isUndefined(totalCases) ? Math.ceil(totalCases / casesPerPage) : 1}
      {...{ casesPerPage }}
    />
  );
};

export default CasesFetcher;
