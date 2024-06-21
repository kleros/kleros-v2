import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { createClient } from "@supabase/supabase-js";

import { EMAIL_REGEX, TELEGRAM_REGEX, ETH_ADDRESS_REGEX } from "consts/processEnvConsts";

import { Database } from "src/types/supabase-notification";

import { authMiddleware } from "../middleware/authMiddleware";

type NotificationSettings = {
  email?: string;
  telegram?: string;
  address: `0x${string}`;
};

const validate = (input: any): NotificationSettings => {
  const requiredKeys: (keyof NotificationSettings)[] = ["address"];
  const optionalKeys: (keyof NotificationSettings)[] = ["email", "telegram"];
  const receivedKeys = Object.keys(input);

  for (const key of requiredKeys) {
    if (!receivedKeys.includes(key)) {
      throw new Error(`Missing key: ${key}`);
    }
  }

  const allExpectedKeys = [...requiredKeys, ...optionalKeys];
  for (const key of receivedKeys) {
    if (!allExpectedKeys.includes(key as keyof NotificationSettings)) {
      throw new Error(`Unexpected key: ${key}`);
    }
  }

  const email = input.email ? input.email.trim() : "";
  if (email && !EMAIL_REGEX.test(email)) {
    throw new Error("Invalid email format");
  }

  const telegram = input.telegram ? input.telegram.trim() : "";
  if (telegram && !TELEGRAM_REGEX.test(telegram)) {
    throw new Error("Invalid Telegram username format");
  }

  if (!ETH_ADDRESS_REGEX.test(input.address)) {
    throw new Error("Invalid Ethereum address format");
  }

  return {
    email: input.email?.trim(),
    telegram: input.telegram?.trim(),
    address: input.address.trim().toLowerCase(),
  };
};

const updateSettings = async (event) => {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }

    const { email, telegram, address } = validate(event.body);
    const lowerCaseAddress = address.toLowerCase() as `0x${string}`;

    // Prevent using someone else's token
    if (event?.auth?.id.toLowerCase() !== lowerCaseAddress) {
      throw new Error("Unauthorised user");
    }
    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_CLIENT_API_KEY!);

    // If the message is empty, delete the user record
    if (email === "" && telegram === "") {
      const { error } = await supabase.from("user-settings").delete().match({ address: lowerCaseAddress });
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ message: "Record deleted successfully." }) };
    }

    // For a user matching this address, upsert the user record
    const { error } = await supabase
      .from("user-settings")
      .upsert({ address: lowerCaseAddress, email: email, telegram: telegram })
      .match({ address: lowerCaseAddress });
    if (error) {
      throw error;
    }
    return { statusCode: 200, body: JSON.stringify({ message: "Record updated successfully." }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: `${err}` }) };
  }
};

export const handler = middy(updateSettings).use(jsonBodyParser()).use(authMiddleware());
