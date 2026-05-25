import "dotenv/config";
import { uploadToIpfs } from "./utils/uploadToIpfs.ts";
import { fetchDisputeArchiveSnapshot } from "./utils/fetchDisputeArchiveSnapshot.ts";
import { fetchDisputeIds } from "./utils/fetchDisputeIds.ts";
import { isDisputeArchived, registerCid } from "./utils/contract.ts";

async function main() {
  console.log("Fetching dispute IDs...");
  const disputeIdsUnsorted = await fetchDisputeIds();

  console.log(`Fetched ${disputeIdsUnsorted.length} ids`);

  const disputeIds = disputeIdsUnsorted.sort((a, b) => Number(a) - Number(b));

  // skip Ids already archived
  for (const id of disputeIds) {
    const isArchived = await isDisputeArchived(id);
    if (isArchived) {
      console.log(`Skipping dispute ${id}. Already archived.`);
      continue;
    }

    console.log(`Archiving dispute ${id} ...`);

    const snapshot = await fetchDisputeArchiveSnapshot(id);

    const cid = await uploadToIpfs(id, snapshot);

    const courtID = snapshot.dispute.court.id;

    const hash = await registerCid(id, courtID, cid);

    console.log(`Dispute ${id} archived with cid: ${cid}. Transaction hash: ${hash}`);
  }
}

main();
