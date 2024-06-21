import middy from "@middy/core";
import { createClient } from "@supabase/supabase-js";

import { Database } from "../../src/types/supabase-notification";
import { authMiddleware } from "../middleware/authMiddleware";

const fetchSettings = async (event) => {
  try {
    const address = event.auth.id;
    const lowerCaseAddress = address.toLowerCase() as `0x${string}`;

    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_CLIENT_API_KEY!);

    const { error, data } = await supabase
      .from("user-settings")
      .select("address, email, telegram")
      .eq("address", lowerCaseAddress)
      .single();

    if (!data) {
      return { statusCode: 404, message: `Error : User not found` };
    }

    if (error) {
      throw error;
    }
    return { statusCode: 200, body: JSON.stringify({ data }) };
  } catch (err) {
    return { statusCode: 500, message: `Error ${err?.message ?? err}` };
  }
};

export const handler = middy(fetchSettings).use(authMiddleware());
