import { paginatedSubgraphQuery } from "./query";

const disputesQuery = `
  query Disputes($first: Int!, $skip: Int!) {
    disputes(first: $first, skip: $skip, orderBy: id, orderDirection: asc) {
      id
    }
  }
`;

export async function fetchDisputeIds() {
  const disputes = await paginatedSubgraphQuery<{ id: string }>("fetchDisputeIds", disputesQuery, "disputes", {});

  return disputes.map((dispute) => dispute.id);
}
