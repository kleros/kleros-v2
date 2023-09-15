import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { DisputeDetailsFragment, useMyCasesQuery } from "queries/useCasesQuery";
import { useFiltersContext } from "context/FilterProvider";
import { useMyCasesCounterQuery } from "queries/useMyCasesCounterQuery";
import { useUserQuery, UserQuery } from "queries/useUser";
import { OrderDirection } from "src/graphql/graphql";
import JurorInfo from "./JurorInfo";
import Courts from "./Courts";
import CasesDisplay from "components/CasesDisplay";
import ConnectWallet from "components/ConnectWallet";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const StyledCasesDisplay = styled(CasesDisplay)`
  margin-top: 64px;
`;

const ConnectWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.primaryText};
`;

const calculatePages = (status: number, data: UserQuery | undefined, casesPerPage: number, myAppeals?: number) => {
  if (!data) {
    return 0;
  }

  let totalCases = 0;

  switch (status) {
    case 1:
      totalCases = data.user?.totalDisputes - data.user?.totalResolvedDisputes;
      break;
    case 2:
      totalCases = data.user?.totalResolvedDisputes ?? 0;
      break;
    case 3:
      totalCases = myAppeals ?? 0;
      break;
    default:
      totalCases = data.user?.totalDisputes ?? 0;
  }

  return totalCases / casesPerPage;
};

const Dashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { combinedQueryFilters, debouncedSearch, timeFilter, statusFilter } = useFiltersContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [courtFilter, setCourtFilter] = useState(0);
  const casesPerPage = 3;
  const disputeSkip = debouncedSearch ? 0 : 3 * (currentPage - 1);
  const direction = timeFilter === 0 ? OrderDirection.Desc : OrderDirection.Asc;
  const courtChoice = courtFilter === 0 ? {} : { court: courtFilter.toString() };
  const { data: userAppealCases } = useMyCasesCounterQuery(address, { ...courtChoice });
  const userAppealCasesNumber = userAppealCases?.user?.totalAppealingDisputes;
  const queryFilters = { ...combinedQueryFilters, ...courtChoice };
  const { data: disputesData } = useMyCasesQuery(address, disputeSkip, queryFilters, direction);
  const { data: userData } = useUserQuery(address);
  const totalPages = calculatePages(statusFilter, userData, casesPerPage, userAppealCasesNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, courtFilter]);

  return (
    <Container>
      {isConnected ? (
        <>
          <JurorInfo />
          <Courts />
          <StyledCasesDisplay
            title="My Cases"
            disputes={disputesData?.user?.disputes as DisputeDetailsFragment[]}
            numberDisputes={userData?.user?.totalDisputes}
            numberClosedDisputes={userData?.user?.totalResolvedDisputes}
            totalPages={totalPages}
            {...{ casesPerPage, currentPage, setCurrentPage, setCourtFilter }}
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
