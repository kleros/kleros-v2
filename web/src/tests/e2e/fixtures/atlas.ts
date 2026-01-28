import { test as base } from "@playwright/test";
import { Hex, recoverMessageAddress } from "viem";

import { createTestJwt } from "../utils/jwt";

type MockAtlasOptions = {
  address?: string;
  accessToken?: string;
};

// mocking atlas apis
export const test = base.extend<{
  mockAtlas: (opts?: MockAtlasOptions) => Promise<void>;
}>({
  mockAtlas: [
    async ({ page }, use) => {
      await page.route("*/**/graphql", async (route, request) => {
        const body = request.postDataJSON();
        const operation = body?.operationName;

        // GetNonce
        if (operation === "GetNonce") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                nonce: "0x1234567890",
              },
            }),
          });
        }

        // Login
        if (operation === "Login") {
          const signature = body.variables.signature! as Hex;
          const message = body.variables.message! as string;
          const address = await recoverMessageAddress({ message, signature });

          const accessToken = await createTestJwt({
            address,
          });

          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                login: {
                  accessToken,
                },
              },
            }),
          });
        }

        // Roles / restrictions
        if (operation === "Roles") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                roles: [
                  {
                    name: "Evidence",
                    restriction: {
                      maxSize: 20971520,
                      allowedMimeTypes: [
                        "video/mp4",
                        "image/jpeg",
                        "image/png",
                        "image/jpg",
                        "image/bmp",
                        "image/gif",
                        "image/tiff",
                        "image/webp",
                        "application/pdf",
                        "text/csv",
                        "text/html",
                        "text/plain",
                      ],
                    },
                  },
                  {
                    name: "Policy",
                    restriction: {
                      maxSize: 10485760,
                      allowedMimeTypes: ["application/pdf", "text/markdown"],
                    },
                  },
                  {
                    name: "Generic",
                    restriction: {
                      maxSize: 409600,
                      allowedMimeTypes: ["video/x-msvideo", "application/pdf", "image/png"],
                    },
                  },
                ],
              },
            }),
          });
        }

        // Default fallback
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: {} }),
        });
      });

      /* ---------------- IPFS upload ---------------- */
      await page.route("**/ipfs/file", async (route) => {
        return route.fulfill({
          status: 200,
          contentType: "text/plain",
          body: "QmVDEj29zAvoBzSPkJMDx7B1Rb5CR8sGNrwei8DDULvDWp",
        });
      });
      await use(async () => {});
    },
    { auto: true },
  ],
});
