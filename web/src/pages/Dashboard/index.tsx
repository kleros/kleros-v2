import React, { useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { OrderDirection } from "src/graphql/graphql";
import { DisputeDetailsFragment, useMyCasesQuery } from "queries/useCasesQuery";
import { useUserQuery } from "queries/useUser";
import { decodeURIFilter, useRootPath } from "utils/uri";
import { isUndefined } from "utils/index";
import CasesDisplay from "components/CasesDisplay";
import ConnectWallet from "components/ConnectWallet";
import JurorInfo from "./JurorInfo";
import Courts from "./Courts";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 80)} ${responsiveSize(24, 136)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
`;

const StyledCasesDisplay = styled(CasesDisplay)`
  margin-top: 64px;

  h1 {
    margin-bottom: ${responsiveSize(16, 48)};
  }
`;

const ConnectWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.primaryText};
`;

const Dashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { page, order, filter } = useParams();
  const location = useRootPath();
  const navigate = useNavigate();
  const casesPerPage = 3;
  const pageNumber = parseInt(page ?? "1");
  const disputeSkip = casesPerPage * (pageNumber - 1);
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const { data: disputesData } = useMyCasesQuery(
    address,
    disputeSkip,
    decodedFilter,
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc
  );
  const { data: userData } = useUserQuery(address, decodedFilter);
  const totalCases = userData?.user?.disputes.length;
  const totalResolvedCases = parseInt(userData?.user?.totalResolvedDisputes);

  const totalPages = useMemo(
    () => (!isUndefined(totalCases) ? Math.ceil(totalCases / casesPerPage) : 1),
    [totalCases, casesPerPage]
  );

  return (
    <Container>
      {isConnected ? (
        <>
          <JurorInfo />
          <Courts />
          <StyledCasesDisplay
            title="My Cases"
            disputes={userData?.user !== null ? (disputesData?.user?.disputes as DisputeDetailsFragment[]) : []}
            numberDisputes={totalCases}
            numberClosedDisputes={totalResolvedCases}
            totalPages={totalPages}
            currentPage={pageNumber}
            setCurrentPage={(newPage: number) => navigate(`${location}/${newPage}/${order}/${filter}`)}
            {...{ casesPerPage }}
          />
        </>
      ) : (
        <ConnectWalletContainer>
          To see your dashboard, connect first
          <hr />
          <ConnectWallet />
        </ConnectWalletContainer>
      )}
    </Container>
  );
};

export default Dashboard;
