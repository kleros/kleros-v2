import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";

import { isKlerosUniversity, isProductionDeployment, isTestnetDeployment } from "src/consts";
import { isUndefined } from "src/utils";

const spamEvidenceQuery = gql`
  query SpamEvidences($deployment: CourtV2Deployment!, $evidenceGroupId: String!) {
    courtv2EvidenceSpamsByGroupId(deployment: $deployment, evidenceGroupId: $evidenceGroupId) {
      evidenceIds
    }
  }
`;

type SpamEvidences = {
  courtv2EvidenceSpamsByGroupId: { evidenceIds: string[] };
};

const getAtlasDeployment = () => {
  if (isKlerosUniversity()) {
    return "university";
    // TODO: remove "beta" reference from Atlas, to be replaced with mainnet (env dependent)
  } else if (isProductionDeployment()) {
    return "beta";
  } else if (isTestnetDeployment()) {
    return "testnet";
  } else {
    return "devnet";
  }
};
const atlasUri = import.meta.env.REACT_APP_ATLAS_URI;

export const useSpamEvidence = (evidenceGroupId: string) => {
  const isEnabled = !isUndefined(atlasUri) && !isUndefined(evidenceGroupId);

  const variables = { deployment: getAtlasDeployment(), evidenceGroupId };
  return useQuery<SpamEvidences>({
    queryKey: [`evidenceSpamQuery`],
    enabled: isEnabled,
    staleTime: 60000,
    queryFn: async () => await request(`${atlasUri}/graphql`, spamEvidenceQuery, variables),
  });
};
