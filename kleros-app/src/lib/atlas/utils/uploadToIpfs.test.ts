import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw/server";
import { ATLAS_URI } from "../../../test/atlas";
import { AuthorizationError, IpfsProduct, Roles, uploadToIpfs } from ".";

const file = new File(["%PDF-1.4"], "evidence.pdf", { type: "application/pdf" });
const upload = () =>
  uploadToIpfs(
    { baseUrl: ATLAS_URI, authToken: "jwt" },
    { file, name: "renamed.pdf", product: IpfsProduct.CourtV2, role: Roles.Evidence }
  );

describe("uploadToIpfs", () => {
  it("posts the file and its metadata as multipart form data with a bearer token", async () => {
    let received: { auth: string | null; fields: Record<string, unknown>; content: string } | undefined;
    server.use(
      http.post(`${ATLAS_URI}/ipfs/file`, async ({ request }) => {
        const form = await request.formData();
        const uploaded = form.get("file") as File;
        received = {
          auth: request.headers.get("authorization"),
          fields: { name: form.get("name"), product: form.get("product"), role: form.get("role") },
          content: await uploaded.text(),
        };
        return HttpResponse.text("QmHash");
      })
    );

    await expect(upload()).resolves.toBe("QmHash");
    expect(received).toEqual({
      auth: "Bearer jwt",
      fields: { name: "renamed.pdf", product: "CourtV2", role: "evidence" },
      content: "%PDF-1.4",
    });
  });

  it("throws AuthorizationError with the server message on 401", async () => {
    server.use(
      http.post(`${ATLAS_URI}/ipfs/file`, () => HttpResponse.json({ message: "jwt expired" }, { status: 401 }))
    );

    const error = await upload().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error).toMatchObject({ name: "AuthorizationError", message: "jwt expired" });
  });

  it("throws a plain Error with the server message on other failures", async () => {
    server.use(http.post(`${ATLAS_URI}/ipfs/file`, () => HttpResponse.json({ message: "too large" }, { status: 413 })));

    const error = await upload().catch((e: unknown) => e);

    expect(error).not.toBeInstanceOf(AuthorizationError);
    expect(error).toMatchObject({ message: "too large" });
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    server.use(http.post(`${ATLAS_URI}/ipfs/file`, () => HttpResponse.text("bad gateway", { status: 502 })));

    await expect(upload()).rejects.toThrow("Error uploading to IPFS");
  });
});
