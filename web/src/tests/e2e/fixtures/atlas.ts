import type { Route } from "@playwright/test";
import { recoverMessageAddress, type Hex } from "viem";

import { createTestJwt } from "../utils/jwt";

import { test as networkTest } from "./network";

const ATLAS = "https://atlas.e2e.test";

export const ATLAS_ROLES = [
  {
    name: "Evidence",
    restriction: { maxSize: 20971520, allowedMimeTypes: ["application/pdf", "image/png", "text/plain"] },
  },
  { name: "Policy", restriction: { maxSize: 10485760, allowedMimeTypes: ["application/pdf", "text/markdown"] } },
  { name: "Generic", restriction: { maxSize: 409600, allowedMimeTypes: ["application/pdf", "image/png"] } },
];

export type AtlasUser = { email: string; isEmailVerified: boolean; emailUpdateableAt: string | null };

export type AtlasOperation = { operationName: string; variables: Record<string, any> };

export type StakingEvent = { address: string; courtId: string; amount: string; timestamp: string; txHash: Hex };

export type AtlasFixture = {
  /** The signed-up user returned by GetUser; null means the address has no account yet. */
  user: AtlasUser | null;
  subscribed: boolean;
  /** Rows returned by GetStakingEvents (court staking history). */
  stakingEvents: StakingEvent[];
  /** Evidence ids moderators flagged as spam, for every evidence group. */
  spamEvidenceIds: string[];
  /** CID the IPFS upload endpoint returns. */
  uploadCid: string;
  /** Every GraphQL operation the app sent, in order. */
  operations: AtlasOperation[];
  uploads: number;
};

/** Atlas is not batched, so operations are keyed on operationName (unlike the subgraph). */
export const test = networkTest.extend<{ atlas: AtlasFixture }>({
  atlas: [
    async ({ page, network }, use) => {
      const atlas: AtlasFixture = {
        user: null,
        subscribed: false,
        stakingEvents: [],
        spamEvidenceIds: [],
        uploadCid: "/ipfs/QmE2eUpload/file.json",
        operations: [],
        uploads: 0,
      };

      const answer = async (route: Route) => {
        const { operationName, variables = {} } = route.request().postDataJSON();
        atlas.operations.push({ operationName, variables });
        switch (operationName) {
          case "GetNonce":
            return route.fulfill({ json: { data: { nonce: "e2eNonce00000001" } } });
          case "Login": {
            const address = await recoverMessageAddress({
              message: variables.message,
              signature: variables.signature as Hex,
            });
            return route.fulfill({ json: { data: { login: { accessToken: await createTestJwt({ address }) } } } });
          }
          case "Roles":
            return route.fulfill({ json: { data: { roles: ATLAS_ROLES } } });
          case "GetUser":
            return atlas.user
              ? route.fulfill({ json: { data: { user: atlas.user } } })
              : route.fulfill({ json: { data: null, errors: [{ message: "User not found" }] } });
          case "isSubscribed":
            return route.fulfill({ json: { data: { isSubscribed: atlas.subscribed } } });
          case "AddUser":
            atlas.user = { email: variables.settings.email, isEmailVerified: false, emailUpdateableAt: null };
            return route.fulfill({ json: { data: { addUser: true } } });
          case "UpdateEmail":
            atlas.user = { email: variables.newEmail, isEmailVerified: false, emailUpdateableAt: null };
            return route.fulfill({ json: { data: { updateEmail: true } } });
          case "ConfirmEmail":
            return route.fulfill({
              json: { data: { confirmEmail: { isConfirmed: true, isTokenExpired: false, isTokenInvalid: false } } },
            });
          case "SpamEvidences":
            return route.fulfill({
              json: { data: { courtv2EvidenceSpamsByGroupId: { evidenceIds: atlas.spamEvidenceIds } } },
            });
          case "GetStakingEvents":
            return route.fulfill({
              json: {
                data: {
                  userStakingEventsV2: {
                    count: atlas.stakingEvents.length,
                    items: atlas.stakingEvents.map((e, i) => ({
                      item: {
                        id: `stake-${i}`,
                        blockHash: e.txHash,
                        transactionHash: e.txHash,
                        blockTimestamp: e.timestamp,
                        network: { chainId: 421614 },
                        args: { _address: e.address, _courtID: e.courtId, _amount: e.amount },
                      },
                    })),
                  },
                },
              },
            });
          default:
            network.unhandled.push(`Atlas operation ${operationName}`);
            return route.fulfill({ status: 400, json: { errors: [{ message: `e2e: unmocked ${operationName}` }] } });
        }
      };

      await page.route(`${ATLAS}/graphql`, answer);
      await page.route(`${ATLAS}/ipfs/file`, (route) => {
        atlas.uploads += 1;
        return route.fulfill({ contentType: "text/plain", body: atlas.uploadCid });
      });

      await use(atlas);
    },
    { auto: true, box: true },
  ],
});
