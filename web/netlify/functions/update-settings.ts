import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

// Configuration
const SUPABASE_KEY = process.env.SUPABASE_CLIENT_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export const handler = async function (event: any, context: any) {
  try {
    // Assuming the event.body contains the data we need
    const { message, signature, address } = JSON.parse(event.body);

    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    // If the recovered address does not match the provided address, return an error
    if (recoveredAddress !== address) {
      throw new Error("Signature verification failed");
    }

    // Allowed columns to update
    const allowedColumns = ["discord", "telegram", "twitter", "matrix", "push", "email"];

    // If the message is empty, delete the user record
    if (message === "{}") {
      let { data, error } = await supabase.from("users").delete().match({ address: recoveredAddress });

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Record deleted successfully." }),
      };
    }

    // Parse the signed message
    const parsedMessage = JSON.parse(message);

    // Prepare the record data based on the allowed columns
    let recordData: { [key: string]: any } = {};
    for (const key in parsedMessage) {
      if (allowedColumns.includes(key)) {
        recordData[key] = parsedMessage[key];
      }
    }

    // Assuming you have a 'users' table with 'address' and allowedColumns fields
    let { data, error } = await supabase.from("user-settings").upsert(recordData).match({ address: recoveredAddress });

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
