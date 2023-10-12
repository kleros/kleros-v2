import { useLocation } from "react-router-dom";
import { Dispute_Filter } from "src/graphql/graphql";

export const encodeURIFilter = (filter: Dispute_Filter): string => {
  if (Object.keys(filter).length === 0) {
    return "all";
  } else {
    return encodeURI(JSON.stringify(filter));
  }
};

export const decodeURIFilter = (filter: string): Dispute_Filter => {
  if (filter === "all") {
    return {};
  } else {
    return JSON.parse(decodeURI(filter));
  }
};

export const useRootPath = () => {
  const location = useLocation();
  return location.pathname.split("/").slice(0, -3).join("/");
};
