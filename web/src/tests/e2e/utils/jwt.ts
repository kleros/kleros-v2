import { SignJWT } from "jose";

const TEST_JWT_SECRET = new TextEncoder().encode(
  "playwright-e2e-secret" // test-only secret
);

export async function createTestJwt({
  address,
  scope = ["user"],
  expiresInYears = 10,
}: {
  address: string;
  scope?: string[];
  expiresInYears?: number;
}) {
  const now = Math.floor(Date.now() / 1000);

  return (
    new SignJWT({
      scope,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(address.toLowerCase())
      .setIssuer("e2e-tests")
      .setIssuedAt(now)
      // 10 years expiry by default, to not expire mid test while fast forwarding
      .setExpirationTime(now + expiresInYears * 365 * 24 * 60 * 60)
      .sign(TEST_JWT_SECRET)
  );
}
