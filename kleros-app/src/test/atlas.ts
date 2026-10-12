import { graphql, HttpResponse, type GraphQLResponseBody } from "msw";
import { UnsecuredJWT } from "jose";
import { GraphQLClient } from "graphql-request";

export const ATLAS_URI = "https://atlas.test";
export const atlas = graphql.link(`${ATLAS_URI}/graphql`);
export const atlasClient = () => new GraphQLClient(`${ATLAS_URI}/graphql`);

export const ALICE = "0x1111111111111111111111111111111111111111";
export const BOB = "0x2222222222222222222222222222222222222222";

/** Unsigned JWT: the provider only decodes tokens, it never verifies signatures. */
export const aToken = ({ sub = ALICE, exp }: { sub?: string; exp?: number } = {}) => {
  const jwt = new UnsecuredJWT({ sub });
  if (exp !== undefined) jwt.setExpirationTime(exp);
  return jwt.encode();
};

export const nowInSeconds = () => Math.floor(Date.now() / 1000);

export const graphqlError = (message: string, code?: string) =>
  HttpResponse.json<GraphQLResponseBody<never>>({
    data: null,
    errors: [{ message, extensions: code ? { code } : undefined }],
  });
