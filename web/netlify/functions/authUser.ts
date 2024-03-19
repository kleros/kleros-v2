import middy from "middy";
import { jsonBodyParser } from "middy/middlewares";
import { ETH_SIGNATURE_REGEX } from "src/consts";
import { SiweMessage } from "siwe";
import * as jwt from "jose";

const authUser = async (event) => {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }

    const signature = event?.body?.signature;
    if (!signature) {
      throw new Error("Missing key : signature");
    }

    if (!ETH_SIGNATURE_REGEX.test(signature)) {
      throw new Error("Invalid signature");
    }

    const message = event?.body?.message;
    if (!message) {
      throw new Error("Missing key : message");
    }

    const address = event?.body?.address;
    if (!address) {
      throw new Error("Missing key : address");
    }

    const siweMessage = new SiweMessage(message);

    if (siweMessage.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Address mismtach in provided address and message");
    }

    try {
      // TODO: Ideally we would want to check domain and origin here too, have not added yet since we would need to change the env for each deploy preview
      // on production :-
      // await siweMessage.verify({signature, domain :"kleros", origin :"https://kleros.io"})
      await siweMessage.verify({ signature });
    } catch (err) {
      throw new Error("Invalid signer");
    }

    const issuer = process.env.JWT_ISSUER ?? "Kleros"; // ex :- Kleros
    const audience = process.env.JWT_AUDIENCE ?? "Court"; // ex :- Court, Curate, Escrow
    const authExp = process.env.JWT_EXP_TIME ?? "2h";
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("Secret not set in environment");
    }

    const encodedSecret = new TextEncoder().encode(secret);

    const token = await new jwt.SignJWT({ id: address.toLowerCase() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(issuer)
      .setAudience(audience)
      .setExpirationTime(authExp)
      .sign(encodedSecret);

    return { statusCode: 200, body: JSON.stringify({ message: "User authorised", token }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: `Error: ${err}` }) };
  }
};

export const handler = middy(authUser).use(jsonBodyParser());
