import { getEnvConfig } from "../config";
import type { DisputeArchiveSnapshot } from "./fetchDisputeArchiveSnapshot";

type UploadResponse = {
  cids: string[];
};

export async function uploadToIpfs(disputeId: string, snapshot: DisputeArchiveSnapshot) {
  const file = new File([JSON.stringify(snapshot)], `dispute-${disputeId}.json`, {
    type: "text/plain",
  });

  const formData = new FormData();
  formData.append("data", file);

  const config = getEnvConfig();

  const response = await fetch(config.ipfsUploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`uploadToIpfs: Failed to upload data for dispute ${disputeId}`);
  }

  const json = (await response.json()) as UploadResponse;

  if (json.cids.length === 0) {
    throw new Error(`uploadToIpfs: Failed to upload data for dispute ${disputeId}. No CID returned.`);
  }

  return json.cids[0];
}
