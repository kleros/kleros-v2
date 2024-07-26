import * as jwt from "jose";

export const authMiddleware = () => {
  return {
    before: async (request) => {
      const { event } = request;

      const authToken = event?.headers?.["x-auth-token"];
      if (!authToken) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: `Error : Missing x-auth-token in Header}` }),
        };
      }

      try {
        // const secret = process.env.JWT_SECRET;
        // TODO testing purpose
        const secret = "u03tzA7Un9w+fetret343t6U2YaOlINle1E4avjc=";

        if (!secret) {
          throw new Error("Secret not set in environment");
        }

        const encodedSecret = new TextEncoder().encode(secret);

        const { payload } = await jwt.jwtVerify(authToken, encodedSecret);

        // add auth details to event
        request.event.auth = payload;
      } catch (err) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: `Error : ${err?.message ?? "Not Authorised"}` }),
        };
      }
    },
  };
};
