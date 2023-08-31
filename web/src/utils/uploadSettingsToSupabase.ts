import { verifyMessage } from "viem";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_KEY = process.env.SUPABASE_CLIENT_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export const uploadSettingsToSupabase = async function (event: any, context: any) {
  try {
    // Assuming the event.body contains the data we need
    const { email, signature, address } = event.body;
    console.log("🚀 ~ file: index.tsx:42 ~ handleSupabase ~ email:", email, signature, address);

    // Recover the address from the signature
    const recoveredAddress = await verifyMessage({
      address,
      message: email,
      signature,
    });
    console.log("🚀 ~ file: index.tsx:45 ~ handleSupabase ~ recoveredAddress:", recoveredAddress);

    // If the recovered address does not match the provided address, return an error
    if (!recoveredAddress) {
      throw new Error("Signature verification failed");
    }

    // Allowed columns to update
    const allowedColumns = ["discord", "telegram", "twitter", "matrix", "push", "email"];

    console.log("1");

    // If the message is empty, delete the user record
    if (email === "{}") {
      let { data, error } = await supabase.from("users").delete().match({ address: recoveredAddress });

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Record deleted successfully." }),
      };
    }

    // Parse the signed message
    console.log("2", email);

    const parsedMessage = JSON.parse(JSON.stringify(email));
    console.log("🚀 ~ file: index.tsx:69 ~ handleSupabase ~ parsedMessage:", parsedMessage);

    // Prepare the record data based on the allowed columns
    let recordData: { [key: string]: any } = {};
    for (const key in parsedMessage) {
      if (allowedColumns.includes(key)) {
        recordData[key] = parsedMessage[key];
      }
    }

    // Assuming you have a 'users' table with 'address' and allowedColumns fields
    let { data, error } = await supabase
      .from("user-settings")
      .upsert({ address, email: email })
      .match({ address: address });

    console.log("🚀 ~ file: index.tsx:89 ~ handleSupabase ~ data:", data);
    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Record updated successfully." }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error: ` }),
    };
  }
};
