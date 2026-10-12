import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpResponse } from "msw";
import { GraphQLError } from "graphql";
import { server } from "../../../test/msw/server";
import { ALICE, atlas, atlasClient, graphqlError } from "../../../test/atlas";
import {
  addUser,
  confirmEmail,
  deleteUser,
  fetchIsSubscribed,
  fetchUser,
  getNonce,
  loginUser,
  SignupProduct,
  IpfsProduct,
  updateEmail,
} from ".";
import { fetchRestrictions } from "./fetchRestrictions";

const user = { email: "a@b.c", isEmailVerified: true, emailUpdateableAt: null };
const roles = [{ name: "Evidence", restriction: { maxSize: 1024, allowedMimeTypes: ["application/pdf"] } }];

describe("Atlas GraphQL helpers", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it.each([
    {
      name: "getNonce",
      handler: atlas.mutation("GetNonce", ({ variables }) =>
        HttpResponse.json({ data: { nonce: `n-${variables.address}` } })
      ),
      call: () => getNonce(atlasClient(), ALICE),
      expected: `n-${ALICE}`,
    },
    {
      name: "loginUser",
      handler: atlas.mutation("Login", ({ variables }) =>
        HttpResponse.json({ data: { login: { accessToken: `${variables.message}|${variables.signature}` } } })
      ),
      call: () => loginUser(atlasClient(), { message: "msg", signature: "0xsig" }),
      expected: "msg|0xsig",
    },
    {
      name: "fetchUser",
      handler: atlas.query("GetUser", () => HttpResponse.json({ data: { user } })),
      call: () => fetchUser(atlasClient()),
      expected: user,
    },
    {
      name: "fetchRestrictions",
      handler: atlas.query("Roles", ({ variables }) =>
        HttpResponse.json({ data: { roles: variables.product === IpfsProduct.CourtV2 ? roles : [] } })
      ),
      call: () => fetchRestrictions(atlasClient(), IpfsProduct.CourtV2),
      expected: roles,
    },
    {
      name: "fetchIsSubscribed",
      handler: atlas.query("isSubscribed", ({ variables }) =>
        HttpResponse.json({ data: { isSubscribed: variables.address === ALICE } })
      ),
      call: () => fetchIsSubscribed(atlasClient(), ALICE),
      expected: true,
    },
    {
      name: "addUser",
      handler: atlas.mutation("AddUser", ({ variables }) =>
        HttpResponse.json({ data: { addUser: variables.settings.product === SignupProduct.CourtV2 } })
      ),
      call: () => addUser(atlasClient(), { email: "a@b.c", product: SignupProduct.CourtV2 }),
      expected: true,
    },
    {
      name: "updateEmail",
      handler: atlas.mutation("UpdateEmail", ({ variables }) =>
        HttpResponse.json({ data: { updateEmail: variables.newEmail === "new@b.c" } })
      ),
      call: () => updateEmail(atlasClient(), { newEmail: "new@b.c", product: SignupProduct.CourtV2 }),
      expected: true,
    },
    {
      name: "deleteUser",
      handler: atlas.mutation("DeleteUser", () => HttpResponse.json({ data: { deleteUser: true } })),
      call: () => deleteUser(atlasClient()),
      expected: true,
    },
    {
      name: "confirmEmail",
      handler: atlas.mutation("ConfirmEmail", () =>
        HttpResponse.json({
          data: { confirmEmail: { isConfirmed: true, isTokenExpired: false, isTokenInvalid: false } },
        })
      ),
      call: () => confirmEmail(atlasClient(), { address: ALICE, token: "t" }),
      expected: { isConfirmed: true, isTokenExpired: false, isTokenInvalid: false },
    },
  ])("$name unwraps the response field", async ({ handler, call, expected }) => {
    server.use(handler);

    await expect(call()).resolves.toEqual(expected);
  });

  it.each([
    { name: "getNonce", op: atlas.mutation, opName: "GetNonce", call: () => getNonce(atlasClient(), ALICE) },
    {
      name: "loginUser",
      op: atlas.mutation,
      opName: "Login",
      call: () => loginUser(atlasClient(), { message: "m", signature: "0x" }),
    },
    { name: "fetchUser", op: atlas.query, opName: "GetUser", call: () => fetchUser(atlasClient()) },
    {
      name: "fetchRestrictions",
      op: atlas.query,
      opName: "Roles",
      call: () => fetchRestrictions(atlasClient(), IpfsProduct.CourtV2),
    },
    {
      name: "fetchIsSubscribed",
      op: atlas.query,
      opName: "isSubscribed",
      call: () => fetchIsSubscribed(atlasClient(), ALICE),
    },
  ])("$name surfaces the first GraphQL error message", async ({ op, opName, call }) => {
    server.use(op(opName, () => graphqlError("rate limited")));

    await expect(call()).rejects.toThrow("rate limited");
  });

  it.each([
    {
      name: "getNonce",
      opName: "GetNonce",
      call: () => getNonce(atlasClient(), ALICE),
      message: "Error fetching nonce",
    },
    {
      name: "loginUser",
      opName: "Login",
      call: () => loginUser(atlasClient(), { message: "m", signature: "0x" }),
      message: "Unknown error",
    },
    {
      name: "addUser",
      opName: "AddUser",
      call: () => addUser(atlasClient(), { email: "e", product: SignupProduct.CourtV2 }),
      message: "Unknown Error",
    },
    { name: "deleteUser", opName: "DeleteUser", call: () => deleteUser(atlasClient()), message: "Unknown Error" },
  ])("$name falls back to '$message' on a network error", async ({ opName, call, message }) => {
    server.use(atlas.mutation(opName, () => HttpResponse.error()));

    await expect(call()).rejects.toThrow(message);
  });

  it.each([
    {
      name: "addUser",
      opName: "AddUser",
      call: () => addUser(atlasClient(), { email: "e", product: SignupProduct.CourtV2 }),
    },
    {
      name: "updateEmail",
      opName: "UpdateEmail",
      call: () => updateEmail(atlasClient(), { newEmail: "e", product: SignupProduct.CourtV2 }),
    },
    { name: "deleteUser", opName: "DeleteUser", call: () => deleteUser(atlasClient()) },
  ])("$name rethrows a GraphQLError that keeps the error extensions", async ({ opName, call }) => {
    server.use(atlas.mutation(opName, () => graphqlError("Unauthorized", "UNAUTHENTICATED")));

    const error = await call().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(GraphQLError);
    expect(error).toMatchObject({ message: "Unauthorized", extensions: { code: "UNAUTHENTICATED" } });
  });

  it("confirmEmail hides the Atlas error behind a generic message", async () => {
    server.use(atlas.mutation("ConfirmEmail", () => graphqlError("token expired")));

    await expect(confirmEmail(atlasClient(), { address: ALICE, token: "t" })).rejects.toThrow("Unable to verify.");
  });
});
