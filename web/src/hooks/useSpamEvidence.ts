import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";

import { isKlerosNeo, isKlerosUniversity, isTestnetDeployment } from "src/consts";
import { graphql } from "src/graphql";
import { isUndefined } from "src/utils";

const spamEvidenceQuery = graphql(`
  query SpamEvidences($deployment: CourtV2Deployment!) {
    courtv2EvidenceSpamsByDeployment(deployment: $deployment) {
      disputeEvidenceIndex
      dispute
    }
  }
`);

type SpamEvidences = {
  courtv2EvidenceSpamsByDeployment: { disputeEvidenceIndex: string; dispute: string }[];
};

const getAtlasDeployment = () => {
  if (isKlerosUniversity()) {
    return "university";
  } else if (isKlerosNeo()) {
    return "beta";
  } else if (isTestnetDeployment()) {
    return "testnet";
  } else {
    return "devnet";
  }
};
const atlasUri = import.meta.env.REACT_APP_ATLAS_URI;

export const useSpamEvidence = () => {
  const isEnabled = !isUndefined(atlasUri);

  const variables = { deployment: getAtlasDeployment() };
  return useQuery<SpamEvidences>({
    queryKey: [`evidenceSpamQuery`],
    enabled: isEnabled,
    staleTime: 60000,
    queryFn: async () => await request(`${atlasUri}/graphql`, spamEvidenceQuery, variables),
  });
};
