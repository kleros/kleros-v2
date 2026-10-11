import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "wagmi";
import { server } from "../../../test/msw/server";
import { ALICE, ATLAS_URI, BOB, aToken, atlas, graphqlError, nowInSeconds } from "../../../test/atlas";
import { AuthorizationError, IpfsProduct, IpfsProductNotConfigured, Roles, SignupProduct } from "../utils";
import { AtlasProvider, useAtlasProvider } from "./AtlasProvider";

const wallet = vi.hoisted(() => ({
  address: undefined as string | undefined,
  chainId: 421614,
  signMessageAsync: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: wallet.address }),
  useChainId: () => wallet.chainId,
  useSignMessage: () => ({ signMessageAsync: wallet.signMessageAsync }),
}));

const MAX_TIMEOUT_MS = 2 ** 31 - 1;
const user = { email: "alice@kleros.io", isEmailVerified: true, emailUpdateableAt: null };
const roles = [
  { name: "Evidence", restriction: { maxSize: 1024 * 1024, allowedMimeTypes: ["image/*", "application/pdf"] } },
];

const renderAtlas = ({
  address = ALICE,
  token,
  ipfsProduct,
}: { address?: string; token?: string; ipfsProduct?: IpfsProduct } = {}) => {
  wallet.address = address;
  if (token) window.sessionStorage.setItem("authToken", JSON.stringify(token));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const config = { uri: ATLAS_URI, signupProduct: SignupProduct.CourtV2, ipfsProduct, wagmiConfig: {} as Config };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AtlasProvider config={config}>{children}</AtlasProvider>
    </QueryClientProvider>
  );
  return renderHook(() => useAtlasProvider(), { wrapper });
};

const validToken = () => aToken({ sub: ALICE, exp: nowInSeconds() + 3600 });

const renderVerified = async (options: { ipfsProduct?: IpfsProduct } = {}) => {
  const rendered = renderAtlas({ token: validToken(), ...options });
  await waitFor(() => expect(rendered.result.current.isVerified).toBe(true));
  return rendered;
};

/** Calls of the provider's expiry scheduler, identified by the callback's name. */
const expiryChecks = (setTimeoutSpy: { mock: { calls: unknown[][] } }) =>
  setTimeoutSpy.mock.calls.filter(([callback]) => (callback as { name?: string }).name === "verifyAndSchedule");

describe("AtlasProvider", () => {
  let userRequests: { authorization: string | null }[];

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    wallet.signMessageAsync.mockReset();
    userRequests = [];
    server.use(
      atlas.query("GetUser", ({ request }) => {
        userRequests.push({ authorization: request.headers.get("authorization") });
        return HttpResponse.json({ data: { user } });
      }),
      atlas.query("Roles", () => HttpResponse.json({ data: { roles } }))
    );
  });

  afterEach(() => {
    // restore the setTimeout spy first, or it would reinstate the fake timer after useRealTimers
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("useAtlasProvider throws outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    // jsdom reports errors thrown during render to stderr unless the error event is cancelled
    const silence = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", silence);

    expect(() => renderHook(() => useAtlasProvider())).toThrow("Context Provider not found.");

    window.removeEventListener("error", silence);
  });

  describe("session check", () => {
    it("is not verified without a stored token", () => {
      const { result } = renderAtlas();

      expect(result.current.isVerified).toBe(false);
    });

    it("verifies a token whose subject is the connected address, case-insensitively, and loads the user", async () => {
      const token = aToken({ sub: ALICE.toUpperCase().replace("0X", "0x"), exp: nowInSeconds() + 3600 });
      const { result } = renderAtlas({ token });

      await waitFor(() => expect(result.current.user).toEqual(user));
      expect(result.current.isVerified).toBe(true);
      expect(result.current.userExists).toBe(true);
      expect(userRequests[0].authorization).toBe(`Bearer ${token}`);
    });

    it.each([
      { name: "a token issued to another address", token: () => aToken({ sub: BOB, exp: nowInSeconds() + 3600 }) },
      { name: "an expired token", token: () => aToken({ sub: ALICE, exp: nowInSeconds() - 1 }) },
      { name: "a malformed token", token: () => "not-a-jwt" },
    ])("rejects $name", ({ token }) => {
      const { result } = renderAtlas({ token: token() });

      expect(result.current.isVerified).toBe(false);
    });

    it("accepts a token without exp", () => {
      const { result } = renderAtlas({ token: aToken({ sub: ALICE }) });

      expect(result.current.isVerified).toBe(true);
    });

    it("drops the session and the cached user when the connected account changes", async () => {
      const { result, rerender } = await renderVerified();
      await waitFor(() => expect(result.current.user).toEqual(user));

      wallet.address = BOB;
      rerender();

      expect(result.current.isVerified).toBe(false);
      await waitFor(() => expect(result.current.user).toBeUndefined());
    });
  });

  describe("expiry timer", () => {
    it("un-verifies the session when the token expires", async () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"], shouldAdvanceTime: true });
      const { result } = renderAtlas({ token: aToken({ sub: ALICE, exp: nowInSeconds() + 60 }) });
      expect(result.current.isVerified).toBe(true);

      await act(() => vi.advanceTimersByTimeAsync(61_000));

      expect(result.current.isVerified).toBe(false);
    });

    // issue: unfiled (exp more than 2^31-1 ms away overflows setTimeout, which then fires every tick)
    it.fails("KNOWN BUG: a token expiring in 30 days does not re-run the expiry check in a loop", () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
      const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
      const exp = nowInSeconds() + 30 * 24 * 3600;
      expect(exp * 1000 - Date.now()).toBeGreaterThan(MAX_TIMEOUT_MS);

      renderAtlas({ token: aToken({ sub: ALICE, exp }) });
      act(() => vi.advanceTimersByTime(1000));

      expect(expiryChecks(setTimeoutSpy).length).toBeLessThanOrEqual(2);
    });

    // issue: unfiled (a token without exp schedules the expiry check with a NaN delay, which fires every tick)
    it.fails("KNOWN BUG: a token without exp does not re-run the expiry check in a loop", () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
      const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

      renderAtlas({ token: aToken({ sub: ALICE }) });
      act(() => vi.advanceTimersByTime(1000));

      expect(expiryChecks(setTimeoutSpy).length).toBeLessThanOrEqual(1);
    });
  });

  describe("authoriseUser", () => {
    const serveLogin = (token: string) => {
      const logins: unknown[] = [];
      server.use(
        atlas.mutation("GetNonce", ({ variables }) =>
          HttpResponse.json({ data: { nonce: `nonce${variables.address.slice(2, 10)}` } })
        ),
        atlas.mutation("Login", ({ variables }) => {
          logins.push(variables);
          return HttpResponse.json({ data: { login: { accessToken: token } } });
        })
      );
      return logins;
    };

    it("signs a SIWE message with the Atlas nonce, logs in and stores the token", async () => {
      const token = validToken();
      const logins = serveLogin(token);
      wallet.signMessageAsync.mockResolvedValue("0xsignature");
      const { result } = renderAtlas();

      await act(() => result.current.authoriseUser());

      const [{ message }] = wallet.signMessageAsync.mock.calls[0];
      expect(message).toContain(`Nonce: nonce${ALICE.slice(2, 10)}`);
      expect(message).toContain("Chain ID: 421614");
      expect(logins).toEqual([{ message, signature: "0xsignature" }]);
      expect(JSON.parse(window.sessionStorage.getItem("authToken")!)).toBe(token);
      await waitFor(() => expect(result.current.isVerified).toBe(true));
      expect(result.current.isSigningIn).toBe(false);
    });

    it("reports isSigningIn while the wallet prompt is open", async () => {
      serveLogin(validToken());
      let approve: (signature: string) => void = () => {};
      wallet.signMessageAsync.mockReturnValue(new Promise((resolve) => (approve = resolve)));
      const { result } = renderAtlas();

      let signIn: Promise<void> = Promise.resolve();
      act(() => {
        signIn = result.current.authoriseUser();
      });
      await waitFor(() => expect(result.current.isSigningIn).toBe(true));
      await act(async () => {
        approve("0xsignature");
        await signIn;
      });

      expect(result.current.isSigningIn).toBe(false);
    });

    it("rejects with the Atlas message when login fails and stores nothing", async () => {
      server.use(
        atlas.mutation("GetNonce", () => HttpResponse.json({ data: { nonce: "nonce12345" } })),
        atlas.mutation("Login", () => graphqlError("Invalid signature"))
      );
      wallet.signMessageAsync.mockResolvedValue("0xsignature");
      const { result } = renderAtlas();

      await act(() => expect(result.current.authoriseUser()).rejects.toThrow("Invalid signature"));

      expect(window.sessionStorage.getItem("authToken")).toBeNull();
      expect(result.current.isSigningIn).toBe(false);
      expect(result.current.isVerified).toBe(false);
    });

    it("does not log in when the wallet rejects the signature", async () => {
      server.use(atlas.mutation("GetNonce", () => HttpResponse.json({ data: { nonce: "nonce12345" } })));
      wallet.signMessageAsync.mockRejectedValue(new Error("User rejected the request."));
      const { result } = renderAtlas();

      await act(() => expect(result.current.authoriseUser()).rejects.toThrow("User rejected the request."));

      expect(window.sessionStorage.getItem("authToken")).toBeNull();
    });

    it("does nothing without a connected account", async () => {
      const { result } = renderAtlas({ address: "" });

      await act(() => result.current.authoriseUser());

      expect(wallet.signMessageAsync).not.toHaveBeenCalled();
    });
  });

  describe.each([
    { name: "addUser", opName: "AddUser", call: (a: ReturnType<typeof useAtlasProvider>) => a.addUser({ email: "e" }) },
    {
      name: "updateEmail",
      opName: "UpdateEmail",
      call: (a: ReturnType<typeof useAtlasProvider>) => a.updateEmail({ newEmail: "e" }),
    },
    { name: "deleteUser", opName: "DeleteUser", call: (a: ReturnType<typeof useAtlasProvider>) => a.deleteUser() },
  ])("$name", ({ name, opName, call }) => {
    it("returns false without a verified session", async () => {
      const { result } = renderAtlas();

      await expect(call(result.current)).resolves.toBe(false);
    });

    it("returns the Atlas result and refetches the user", async () => {
      server.use(atlas.mutation(opName, () => HttpResponse.json({ data: { [name]: true } })));
      const { result } = await renderVerified();
      await waitFor(() => expect(userRequests).toHaveLength(1));

      await act(async () => {
        await expect(call(result.current)).resolves.toBe(true);
      });

      await waitFor(() => expect(userRequests).toHaveLength(2));
    });

    it("un-verifies the session on an UNAUTHENTICATED error", async () => {
      server.use(atlas.mutation(opName, () => graphqlError("Unauthorized", "UNAUTHENTICATED")));
      const { result } = await renderVerified();

      await act(() => expect(call(result.current)).rejects.toThrow("Unauthorized"));

      expect(result.current.isVerified).toBe(false);
    });

    it("keeps the session on other errors", async () => {
      server.use(atlas.mutation(opName, () => graphqlError("Email already in use", "BAD_USER_INPUT")));
      const { result } = await renderVerified();

      await act(() => expect(call(result.current)).rejects.toThrow("Email already in use"));

      expect(result.current.isVerified).toBe(true);
    });
  });

  it.each([
    { name: "addUser", opName: "AddUser", pick: (v: Record<string, any>) => v.settings.product },
    { name: "updateEmail", opName: "UpdateEmail", pick: (v: Record<string, any>) => v.product },
  ])("$name sends the configured signupProduct", async ({ name, opName, pick }) => {
    const products: unknown[] = [];
    server.use(
      atlas.mutation(opName, ({ variables }) => {
        products.push(pick(variables));
        return HttpResponse.json({ data: { [name]: true } });
      })
    );
    const { result } = await renderVerified();

    await act(async () => {
      await (name === "addUser"
        ? result.current.addUser({ email: "e" })
        : result.current.updateEmail({ newEmail: "e" }));
    });

    expect(products).toEqual([SignupProduct.CourtV2]);
  });

  describe("uploadFile", () => {
    const png = (size = 10) => new File(["x".repeat(size)], "a.png", { type: "image/png" });

    const serveUpload = (response: () => Response = () => HttpResponse.text("QmHash")) => {
      const uploads: { authorization: string | null }[] = [];
      server.use(
        http.post(`${ATLAS_URI}/ipfs/file`, ({ request }) => {
          uploads.push({ authorization: request.headers.get("authorization") });
          return response();
        })
      );
      return uploads;
    };

    it("throws IpfsProductNotConfigured without ipfsProduct", async () => {
      const { result } = await renderVerified();

      await expect(result.current.uploadFile(png(), Roles.Evidence)).rejects.toThrow(IpfsProductNotConfigured);
    });

    it("returns null without a verified session", async () => {
      const { result } = renderAtlas({ ipfsProduct: IpfsProduct.CourtV2 });

      await expect(result.current.uploadFile(png(), Roles.Evidence)).resolves.toBeNull();
    });

    it.each([
      { name: "an image/* match", file: () => png() },
      { name: "an exact mime match", file: () => new File(["%PDF"], "a.pdf", { type: "application/pdf" }) },
    ])("uploads $name and returns the IPFS path", async ({ file }) => {
      const uploads = serveUpload();
      const { result } = await renderVerified({ ipfsProduct: IpfsProduct.CourtV2 });
      await waitFor(() => expect(result.current.roleRestrictions).toEqual(roles));

      let path: string | null = null;
      await act(async () => {
        path = await result.current.uploadFile(file(), Roles.Evidence);
      });

      expect(path).toBe("/ipfs/QmHash");
      expect(uploads).toHaveLength(1);
      expect(uploads[0].authorization).toMatch(/^Bearer /);
      expect(result.current.isUploadingFile).toBe(false);
    });

    it.each([
      { name: "an unsupported role", file: () => png(), role: Roles.Policy, error: "Unsupported role." },
      {
        name: "a disallowed mime type",
        file: () => new File(["x"], "a.txt", { type: "text/plain" }),
        role: Roles.Evidence,
        error: "Unsupported file type.",
      },
      {
        name: "a file above maxSize",
        file: () => png(1024 * 1024 + 1),
        role: Roles.Evidence,
        error: "File too big. Max allowed size : 1.00 mb.",
      },
    ])("rejects $name without uploading", async ({ file, role, error }) => {
      const { result } = await renderVerified({ ipfsProduct: IpfsProduct.CourtV2 });
      await waitFor(() => expect(result.current.roleRestrictions).toEqual(roles));

      await act(() => expect(result.current.uploadFile(file(), role)).rejects.toThrow(error));

      expect(result.current.isUploadingFile).toBe(false);
    });

    it("refetches role restrictions when the background fetch failed", async () => {
      // react-query logs an error when a queryFn resolves to undefined, which the failed fetch does
      vi.spyOn(console, "error").mockImplementation(() => {});
      let rolesRequests = 0;
      server.use(
        atlas.query("Roles", () => {
          rolesRequests += 1;
          return rolesRequests === 1 ? graphqlError("busy") : HttpResponse.json({ data: { roles } });
        })
      );
      serveUpload();
      const { result } = await renderVerified({ ipfsProduct: IpfsProduct.CourtV2 });
      await waitFor(() => expect(rolesRequests).toBe(1));
      expect(result.current.roleRestrictions).toBeUndefined();

      let path: string | null = null;
      await act(async () => {
        path = await result.current.uploadFile(png(), Roles.Evidence);
      });

      expect(rolesRequests).toBe(2);
      expect(path).toBe("/ipfs/QmHash");
    });

    it("rejects when role restrictions are still unavailable", async () => {
      server.use(atlas.query("Roles", () => HttpResponse.json({ data: { roles: null } })));
      const { result } = await renderVerified({ ipfsProduct: IpfsProduct.CourtV2 });

      await act(() =>
        expect(result.current.uploadFile(png(), Roles.Evidence)).rejects.toThrow(
          "uploadFile: Unable to fetch role restrictions for CourtV2"
        )
      );
    });

    it("un-verifies the session when the upload is unauthorised", async () => {
      serveUpload(() => HttpResponse.json({ message: "jwt expired" }, { status: 401 }));
      const { result } = await renderVerified({ ipfsProduct: IpfsProduct.CourtV2 });
      await waitFor(() => expect(result.current.roleRestrictions).toEqual(roles));

      await act(() => expect(result.current.uploadFile(png(), Roles.Evidence)).rejects.toThrow(AuthorizationError));

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isUploadingFile).toBe(false);
    });
  });

  describe("confirmEmail", () => {
    it("returns the Atlas result with isError false", async () => {
      const confirmation = { isConfirmed: true, isTokenExpired: false, isTokenInvalid: false };
      server.use(atlas.mutation("ConfirmEmail", () => HttpResponse.json({ data: { confirmEmail: confirmation } })));
      const { result } = renderAtlas();

      let response: unknown;
      await act(async () => {
        response = await result.current.confirmEmail({ address: ALICE, token: "t" });
      });

      expect(response).toEqual({ ...confirmation, isError: false });
      expect(result.current.isConfirmingEmail).toBe(false);
    });

    it.each([
      { name: "a GraphQL error", response: () => graphqlError("token expired") },
      { name: "a network error", response: () => HttpResponse.error() },
    ])("maps $name to isError true", async ({ response }) => {
      server.use(atlas.mutation("ConfirmEmail", response));
      const { result } = renderAtlas();

      let outcome: unknown;
      await act(async () => {
        outcome = await result.current.confirmEmail({ address: ALICE, token: "t" });
      });

      expect(outcome).toEqual({ isConfirmed: false, isTokenExpired: false, isTokenInvalid: false, isError: true });
    });
  });

  it("checkIsSubscribed queries Atlas for the given address", async () => {
    server.use(
      atlas.query("isSubscribed", ({ variables }) =>
        HttpResponse.json({ data: { isSubscribed: variables.address === BOB } })
      )
    );
    const { result } = renderAtlas();

    await expect(result.current.checkIsSubscribed(BOB)).resolves.toBe(true);
  });
});
