import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const ESTUARI_API_KEY = process.env["ESTUARY_API_KEY"];
const ESTUARI_URL = "https://api.estuary.tech/content/add";

export const handler: Handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.body) {
    const newHeaders = event.headers;
    delete newHeaders.host;
    const response = await fetch(ESTUARI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ESTUARI_API_KEY}`,
        ...newHeaders,
      },
      body: Buffer.from(event.body, "base64"),
    });

    const parsedResponse = await response.json();
    return {
      statusCode: response.status,
      body: JSON.stringify(parsedResponse),
    };
  }
  return {
    statusCode: 500,
    body: JSON.stringify({ message: "Invalid body format" }),
  };
};
