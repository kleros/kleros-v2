import React, { useState, createContext, useContext, useMemo } from "react";
import { useDebounce } from "react-use";
import { Dispute_Filter, Period } from "src/graphql/graphql";

interface IFilters {
  search: string;
  setSearch: (arg0: string) => void;
  debouncedSearch: string;
  statusFilter: number;
  timeFilter: number | string;
  setTimeFilter: (arg0: number | string) => void;
  combinedQueryFilters: Dispute_Filter;
  setStatusFilter: (arg0: number) => void;
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
  timeFilter: 0,
  setTimeFilter: () => {
    //
  },

  combinedQueryFilters: {},
});

export const getStatusPeriod = (statusFilter: number) => {
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
  const [statusFilter, setStatusFilter] = useState(0);
  const [timeFilter, setTimeFilter] = useState<number | string>(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useDebounce(() => setDebouncedSearch(search), 500, [search]);
  const periodStatus = getStatusPeriod(statusFilter);
  const queryFilter = debouncedSearch ? { id: debouncedSearch } : undefined;

  const combinedQueryFilters = {
    ...queryFilter,
    ...periodStatus,
  };

  const value = useMemo(
    () => ({
      search,
      setSearch,
      debouncedSearch,
      timeFilter,
      setTimeFilter,
      statusFilter,
      setStatusFilter,
      combinedQueryFilters,
    }),
    [search, debouncedSearch, timeFilter, statusFilter]
  );
  return <Context.Provider {...{ value }}>{children}</Context.Provider>;
};

export const useFiltersContext = () => useContext(Context);
