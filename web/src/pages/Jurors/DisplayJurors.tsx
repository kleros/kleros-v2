import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Address } from "viem";

import { StandardPagination } from "@kleros/ui-components-library";

import { useScrollTop } from "hooks/useScrollTop";
import { isUndefined } from "utils/index";
import { decodeURIFilter } from "utils/uri";

import { useJurorsByCoherenceScore } from "queries/useJurorsByCoherenceScore";

import { OrderDirection } from "src/graphql/graphql";

import { SkeletonDisputeListItem } from "components/StyledSkeleton";

import { ListContainer, StyledLabel } from "../Home/TopJurors";
import Header from "../Home/TopJurors/Header";
import JurorCard from "../Home/TopJurors/JurorCard";

interface IDisplayJurors {
  totalLeaderboardJurors?: number;
}

const DisplayJurors: React.FC<IDisplayJurors> = ({ totalLeaderboardJurors }) => {
  const { t } = useTranslation();
  const { page, order, filter } = useParams();
  const scrollTop = useScrollTop();
  const { id: searchValue } = decodeURIFilter(filter ?? "all");
  const navigate = useNavigate();
  const jurorsPerPage = 10;
  const currentPage = parseInt(page ?? "1");
  const jurorSkip = jurorsPerPage * (currentPage - 1);
  const { data: queryJurors } = useJurorsByCoherenceScore(
    jurorSkip,
    jurorsPerPage,
    "coherenceScore",
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc,
    searchValue || ""
  );

  const jurors = useMemo(() => {
    const baseJurors = queryJurors?.users?.map((juror, index) => ({
      ...juror,
      rank: searchValue ? undefined : jurorSkip + index + 1,
    }));
    if (!searchValue && order === "asc" && baseJurors && !isUndefined(totalLeaderboardJurors)) {
      return baseJurors.map((juror) => ({
        ...juror,
        rank: totalLeaderboardJurors - (juror.rank || 0) + 1,
      }));
    }
    return baseJurors;
  }, [queryJurors, jurorSkip, order, totalLeaderboardJurors, searchValue]);

  const totalPages = useMemo(
    () => (!isUndefined(totalLeaderboardJurors) ? Math.ceil(totalLeaderboardJurors / jurorsPerPage) : 1),
    [totalLeaderboardJurors, jurorsPerPage]
  );

  const handlePageChange = (newPage: number) => {
    scrollTop(true);
    navigate(`/jurors/${newPage}/${order}/${filter}`);
  };

  return (
    <>
      {isUndefined(totalLeaderboardJurors) ? (
        <>
          <ListContainer>
            <Header />
            {[...Array(jurorsPerPage)].map((_, i) => (
              <SkeletonDisputeListItem key={i} />
            ))}
          </ListContainer>
          {!searchValue && (
            <StandardPagination
              currentPage={currentPage}
              numPages={totalPages}
              callback={handlePageChange}
              className="mt-6 ml-auto mr-auto"
            />
          )}
        </>
      ) : (
        <ListContainer>
          {!isUndefined(jurors) && jurors.length === 0 ? (
            <StyledLabel>{t("misc.no_jurors_found")}</StyledLabel>
          ) : (
            <>
              <Header />
              {!isUndefined(jurors)
                ? jurors.map((juror) => <JurorCard key={juror.id} {...juror} address={juror.id as Address} />)
                : [...Array(jurorsPerPage)].map((_, i) => <SkeletonDisputeListItem key={i} />)}
              {!searchValue && (
                <StandardPagination
                  currentPage={currentPage}
                  numPages={totalPages}
                  callback={handlePageChange}
                  className="mt-6 ml-auto mr-auto"
                />
              )}
            </>
          )}
        </ListContainer>
      )}
    </>
  );
};

export default DisplayJurors;
