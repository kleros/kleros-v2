import { useQuery } from "@tanstack/react-query";

const SCOUT_SUBGRAPH_URL = import.meta.env.REACT_APP_SCOUT_SUBGRAPH_URL;

const SCOUT_ACTIVITY_QUERY = `
  query ScoutActivity($address: String!) {
    submissions: LItem(
      where: { requests: { requester: { _eq: $address } } }
      limit: 1
    ) {
      id
    }
    disputesAsRequester: LItem(
      where: {
        disputed: { _eq: true }
        requests: { disputed: { _eq: true }, requester: { _eq: $address } }
      }
      limit: 1
    ) {
      id
    }
    disputesAsChallenger: LItem(
      where: {
        disputed: { _eq: true }
        requests: { disputed: { _eq: true }, challenger: { _eq: $address } }
      }
      limit: 1
    ) {
      id
    }
  }
`;

export const useScoutActivity = (address?: string) => {
  return useQuery({
    queryKey: ["scoutActivity", address?.toLowerCase()],
    enabled: !!address && !!SCOUT_SUBGRAPH_URL,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const response = await fetch(SCOUT_SUBGRAPH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: SCOUT_ACTIVITY_QUERY,
          variables: { address: address?.toLowerCase() },
        }),
      });
      if (!response.ok) return false;
      const json = await response.json();
      const submissions = json?.data?.submissions ?? [];
      const disputesAsRequester = json?.data?.disputesAsRequester ?? [];
      const disputesAsChallenger = json?.data?.disputesAsChallenger ?? [];
      return submissions.length > 0 || disputesAsRequester.length > 0 || disputesAsChallenger.length > 0;
    },
  });
};
