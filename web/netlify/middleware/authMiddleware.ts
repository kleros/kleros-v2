import { NextFunction, type HandlerLambda } from "middy";
import * as jwt from "jose";

export const authMiddleware = () => {
  return {
    before: async (handler: HandlerLambda, next: NextFunction) => {
      const authToken = handler.event?.headers?.["x-auth-token"];
      if (!authToken) {
        return handler.callback(null, {
          statusCode: 400,
          body: JSON.stringify({ message: `Error : Missing x-auth-token in Header}` }),
        });
      }

      try {
        const issuer = process.env.JWT_ISSUER ?? "Kleros"; // ex :- Kleros
        const audience = process.env.JWT_AUDIENCE ?? "Court"; // ex :- Court, Curate, Escrow
        const secret = process.env.JWT_SECRET;

        if (!secret) {
          throw new Error("Secret not set in environment");
        }

        const encodedSecret = new TextEncoder().encode(secret);

        const { payload } = await jwt.jwtVerify(authToken, encodedSecret, { issuer, audience });

        // add auth details to event
        handler.event.auth = payload;

        next();
      } catch (err) {
        return handler.callback(null, {
          statusCode: 401,
          body: JSON.stringify({ message: `Error : ${err?.message ?? "Not Authorised"}` }),
        });
      }
    },
  };
};
