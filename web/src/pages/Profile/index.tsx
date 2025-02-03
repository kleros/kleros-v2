import React, { useMemo } from "react";

import styled, { css } from "styled-components";
import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { isUndefined } from "utils/index";
import { decodeURIFilter, useRootPath } from "utils/uri";
import { DisputeDetailsFragment, useMyCasesQuery } from "queries/useCasesQuery";
import { useUserQuery } from "queries/useUser";
import { OrderDirection } from "src/graphql/graphql";

import CasesDisplay from "components/CasesDisplay";
import ConnectWallet from "components/ConnectWallet";
import FavoriteCases from "components/FavoriteCases";
import ScrollTop from "components/ScrollTop";
import Courts from "./Courts";
import JurorInfo from "./JurorInfo";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px 16px 40px;
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;

  ${landscapeStyle(
    () => css`
      padding: 48px ${responsiveSize(0, 132)} 60px;
    `
  )}
`;

const StyledCasesDisplay = styled(CasesDisplay)`
  margin-top: ${responsiveSize(24, 48)};

  .title {
    margin-bottom: ${responsiveSize(12, 24)};
  }
`;

const ConnectWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.primaryText};
`;

const Profile: React.FC = () => {
  const { isConnected, address: connectedAddress } = useAccount();
  const { page, order, filter } = useParams();
  const [searchParams] = useSearchParams();
  const location = useRootPath();
  const navigate = useNavigate();
  const searchParamAddress = searchParams.get("address")?.toLowerCase();
  const addressToQuery = searchParamAddress || connectedAddress?.toLowerCase();
  const casesPerPage = 3;
  const pageNumber = parseInt(page ?? "1");
  const disputeSkip = casesPerPage * (pageNumber - 1);
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const { data: disputesData } = useMyCasesQuery(
    addressToQuery,
    disputeSkip,
    decodedFilter,
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc
  );
  const { data: userData } = useUserQuery(addressToQuery, decodedFilter);
  const totalCases = userData?.user?.disputes.length;
  const totalResolvedCases = parseInt(userData?.user?.totalResolvedDisputes);
  const totalPages = useMemo(
    () => (!isUndefined(totalCases) ? Math.ceil(totalCases / casesPerPage) : 1),
    [totalCases, casesPerPage]
  );

  return (
    <Container>
      {isConnected || searchParamAddress ? (
        <>
          <JurorInfo {...{ addressToQuery }} />
          <Courts {...{ addressToQuery }} />
          <StyledCasesDisplay
            title={`${searchParamAddress ? "Their" : "My"} Cases`}
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
        </>
      ) : (
        <ConnectWalletContainer>
          To see your profile, connect first
          <hr />
          <ConnectWallet />
        </ConnectWalletContainer>
      )}
      <FavoriteCases />
      <ScrollTop />
    </Container>
  );
};

export default Profile;
