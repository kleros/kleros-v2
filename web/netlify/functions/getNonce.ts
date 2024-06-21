import middy from "@middy/core";
import { createClient } from "@supabase/supabase-js";
import { generateNonce } from "siwe";

import { ETH_ADDRESS_REGEX } from "consts/processEnvConsts";

import { Database } from "src/types/supabase-notification";

const getNonce = async (event) => {
  try {
    const { queryStringParameters } = event;

    if (!queryStringParameters?.address) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid query parameters" }),
      };
    }

    const { address } = queryStringParameters;

    if (!ETH_ADDRESS_REGEX.test(address)) {
      throw new Error("Invalid Ethereum address format");
    }

    const lowerCaseAddress = address.toLowerCase() as `0x${string}`;

    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_CLIENT_API_KEY!);

    // generate nonce and save in db
    const nonce = generateNonce();

    const { error } = await supabase
      .from("user-nonce")
      .upsert({ address: lowerCaseAddress, nonce: nonce })
      .eq("address", lowerCaseAddress);

    if (error) {
      throw error;
    }

    return { statusCode: 200, body: JSON.stringify({ nonce }) };
  } catch (err) {
    console.log(err);

    return { statusCode: 500, message: `Error ${err?.message ?? err}` };
  }
};

export const handler = middy(getNonce);
