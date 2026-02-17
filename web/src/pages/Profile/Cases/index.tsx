import React, { useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { isUndefined } from "utils/index";
import { decodeURIFilter, useRootPath } from "utils/uri";

import { useMyCasesQuery } from "queries/useCasesQuery";
import { useUserQuery } from "queries/useUser";

import { DisputeDetailsFragment, OrderDirection } from "src/graphql/graphql";

import { responsiveSize } from "styles/responsiveSize";

import CasesDisplay from "components/CasesDisplay";

const StyledCasesDisplay = styled(CasesDisplay)`
  margin-top: ${responsiveSize(24, 32)};

  .title {
    margin-bottom: ${responsiveSize(12, 24)};
  }
`;

interface ICases {
  searchParamAddress: `0x${string}`;
}

const Cases: React.FC<ICases> = ({ searchParamAddress }) => {
  const { t } = useTranslation();
  const { page, order, filter } = useParams();
  const [searchParams] = useSearchParams();
  const location = useRootPath();
  const navigate = useNavigate();

  const casesPerPage = 3;
  const pageNumber = parseInt(page ?? "1");
  const disputeSkip = casesPerPage * (pageNumber - 1);
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const { data: disputesData } = useMyCasesQuery(
    searchParamAddress,
    disputeSkip,
    decodedFilter,
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc
  );

  const { data: userData } = useUserQuery(searchParamAddress, decodedFilter);
  const totalCases = userData?.user?.disputes.length;
  const totalResolvedCases = parseInt(userData?.user?.totalResolvedDisputes);
  const totalPages = useMemo(
    () => (!isUndefined(totalCases) ? Math.ceil(totalCases / casesPerPage) : 1),
    [totalCases, casesPerPage]
  );

  return (
    <StyledCasesDisplay
      title={t("profile.cases_drawn")}
      disputes={userData?.user !== null ? (disputesData?.user?.disputes as DisputeDetailsFragment[]) : []}
      numberDisputes={totalCases}
      numberClosedDisputes={totalResolvedCases}
      totalPages={totalPages}
      currentPage={pageNumber}
      setCurrentPage={(newPage: number) =>
        navigate(`${location}/${newPage}/${order}/${filter}?${searchParams.toString()}`)
      }
      {...{ casesPerPage }}
    />
  );
};

export default Cases;
