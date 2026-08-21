import type { DisputeDetails } from "@kleros/kleros-sdk";

import { fetchDisputeDetailsFromSubgraph, type SubgraphDisputeDetails } from "./fetchDisputeDetailsFromSubgraph";
import { fetchDisputeEvidences, type Evidence } from "./fetchDisputeEvidences";
import { fetchPopulatedDisputeData } from "./fetchPopulatedDisputeData";
import { type DisputeTemplate, fetchDisputeTemplate } from "./fetchDisputeTemplate";

/**
 * - dispute : Dispute details from subgraph, required by the FE to render the dispute and related details.
 * - populated :  Populated dispute data from kleros-sdk.
 * - evidences : Evidences for the dispute.
 * - disputeTemplate : template data for dispute, helpful in case the dispute is broken
 */
export type DisputeArchiveSnapshot = {
  dispute: SubgraphDisputeDetails;
  populated: DisputeDetails | undefined;
  evidences: Evidence[];
  disputeTemplate: DisputeTemplate;
};

export async function fetchDisputeArchiveSnapshot(disputeID: string): Promise<DisputeArchiveSnapshot> {
  const dispute = await fetchDisputeDetailsFromSubgraph(disputeID);
  if (!dispute) {
    throw new Error(`Archive snapshot: subgraph dispute missing for id ${disputeID}`);
  }

  if (!dispute.templateId) {
    throw new Error(`Archive snapshot: template Id missing for dispute ${disputeID}`);
  }

  if (!dispute.externalDisputeId) {
    throw new Error(`Archive snapshot: externalDisputeId missing for dispute ${disputeID}`);
  }

  const [populated, evidences, disputeTemplate] = await Promise.all([
    fetchPopulatedDisputeData(disputeID),
    fetchDisputeEvidences(dispute.externalDisputeId),
    fetchDisputeTemplate(dispute.templateId),
  ]);

  if (!populated) {
    console.warn(`Archive snapshot: getDispute returned no data for dispute ${disputeID}`);
  }

  if (evidences.length === 0) {
    console.log(`Archive snapshot: no evidences found for dispute ${disputeID}`);
  }

  return {
    dispute,
    populated,
    evidences,
    disputeTemplate,
  };
}
