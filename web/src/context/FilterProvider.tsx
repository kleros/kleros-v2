import React, { useState, createContext, useContext, useMemo, useEffect } from "react";
import { useDebounce } from "react-use";
import { useAccount } from "wagmi";
import { DisputeDetailsFragment, useMyCasesQuery } from "queries/useCasesQuery";
import { useCasesQuery } from "hooks/queries/useCasesQuery";
import { OrderDirection, Period } from "src/graphql/graphql";

interface IFilters {
  search: string;
  setSearch: (arg0: string) => void;
  debouncedSearch: string;
  statusFilter: number;
  courtFilter: number;
  filteredCases: DisputeDetailsFragment[];
  setFilteredCases: (arg0: DisputeDetailsFragment[]) => void;
  setCourtFilter: (arg0: number) => void;
  timeFilter: number | string;
  setTimeFilter: (arg0: number | string) => void;
  currentPage: number;
  setCurrentPage: (arg0: number) => void;
  isDashboard: boolean;
  setIsDashboard: (arg0: boolean) => void;
  setStatusFilter: (arg0: number) => void;
  isFilterApplied: boolean;
}

const Context = createContext<IFilters>({
  search: "",
  setSearch: () => {
    //
  },
  debouncedSearch: "",
  statusFilter: 0,
  setStatusFilter: () => {
    //
  },
  isDashboard: false,
  setIsDashboard: () => {
    //
  },
  courtFilter: 0,
  setCourtFilter: () => {
    //
  },
  timeFilter: 0,
  setTimeFilter: () => {
    //
  },
  filteredCases: [],
  setFilteredCases: () => {
    //
  },
  currentPage: 1,
  setCurrentPage: () => {
    //
  },
  isFilterApplied: false,
});

const getStatusPeriod = (statusFilter: number) => {
  switch (statusFilter) {
    case 1:
      return { ruled: false };
    case 2:
      return { ruled: true };
    case 3:
      return { period: Period.Appeal, ruled: false };
    default:
      return {};
  }
};

export const FilterProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(0);
  const [courtFilter, setCourtFilter] = useState(0);
  const [isDashboard, setIsDashboard] = useState(false);
  const [timeFilter, setTimeFilter] = useState<number | string>(0);
  const [search, setSearch] = useState("");
  const [filteredCases, setFilteredCases] = useState<DisputeDetailsFragment[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useDebounce(() => setDebouncedSearch(search), 500, [search]);
  const direction = timeFilter === 0 ? OrderDirection.Desc : OrderDirection.Asc;
  const disputeSkip = debouncedSearch ? 0 : 3 * (currentPage - 1);
  const periodStatus = getStatusPeriod(statusFilter);
  const queryFilter = debouncedSearch ? { id: debouncedSearch } : undefined;
  const courtChoice = courtFilter === 0 ? {} : { court: courtFilter.toString() };

  const combinedQueryFilters = {
    ...queryFilter,
    ...periodStatus,
    ...courtChoice,
  };
  const { data } = useCasesQuery(disputeSkip, combinedQueryFilters, direction);
  const { data: dashboardData } = useMyCasesQuery(address, disputeSkip, combinedQueryFilters, direction);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const disputes = isDashboard
      ? (dashboardData?.user?.disputes as DisputeDetailsFragment[])
      : (data?.disputes as DisputeDetailsFragment[]);

    if (search !== "" || statusFilter !== 0 || courtFilter !== 0 || timeFilter !== 0) {
      setIsFilterApplied(true);
    } else {
      setIsFilterApplied(false);
    }

    setFilteredCases(disputes);
  }, [debouncedSearch, data, timeFilter, courtFilter, statusFilter, dashboardData]);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      debouncedSearch,
      courtFilter,
      setCourtFilter,
      timeFilter,
      setTimeFilter,
      statusFilter,
      setStatusFilter,
      filteredCases,
      setFilteredCases,
      currentPage,
      setCurrentPage,
      isDashboard,
      setIsDashboard,
      isFilterApplied,
    }),
    [search, debouncedSearch, timeFilter, statusFilter, filteredCases]
  );
  return <Context.Provider {...{ value }}>{children}</Context.Provider>;
};

export const useFiltersContext = () => useContext(Context);
