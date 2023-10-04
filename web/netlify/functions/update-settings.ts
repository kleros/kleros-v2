import { Handler } from "@netlify/functions";
import { verifyTypedData } from "viem";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../src/types/supabase-notification";
import messages from "../../src/consts/eip712-messages";

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_CLIENT_API_KEY!);

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }
    // TODO: sanitize event.body
    const { email, telegram, nonce, address, signature } = JSON.parse(event.body);
    const lowerCaseAddress = address.toLowerCase() as `0x${string}`;
    // Note: this does NOT work for smart contract wallets, but viem's publicClient.verifyMessage() fails to verify atm.
    // https://viem.sh/docs/utilities/verifyTypedData.html
    const isValid = await verifyTypedData({
      ...messages.contactDetails(address, nonce, telegram, email),
      signature,
    });
    if (!isValid) {
      // If the recovered address does not match the provided address, return an error
      throw new Error("Signature verification failed");
    }
    // TODO: use typed supabase client
    // If the message is empty, delete the user record
    if (email === "" && telegram === "") {
      const { error } = await supabase.from("users").delete().match({ address: lowerCaseAddress });
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ message: "Record deleted successfully." }) };
    }
    // For a user matching this address, upsert the user record
    const { error } = await supabase
      .from("user-settings")
      .upsert({ address: lowerCaseAddress, email: email, telegram: telegram })
      .match({ address: lowerCaseAddress });
    if (error) throw error;
    return { statusCode: 200, body: JSON.stringify({ message: "Record updated successfully." }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: `Error: ${err}` }) };
  }
};
