import { Handler } from "@netlify/functions";
import { verifyTypedData } from "viem";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../src/types/supabase-notification";
import messages from "../../src/consts/eip712-messages";
import { EMAIL_REGEX, TELEGRAM_REGEX, ETH_ADDRESS_REGEX, ETH_SIGNATURE_REGEX } from "../../src/consts/index";

type NotificationSettings = {
  email?: string;
  telegram?: string;
  nonce: `${number}`;
  address: `0x${string}`;
  signature: string;
};

const parse = (inputString: string): NotificationSettings => {
  let input;
  try {
    input = JSON.parse(inputString);
  } catch (err) {
    throw new Error("Invalid JSON format");
  }

  const requiredKeys: (keyof NotificationSettings)[] = ["nonce", "address", "signature"];
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

  if (!/^\d+$/.test(input.nonce)) {
    throw new Error("Invalid nonce format. Expected an integer as a string.");
  }

  if (!ETH_ADDRESS_REGEX.test(input.address)) {
    throw new Error("Invalid Ethereum address format");
  }

  if (!ETH_SIGNATURE_REGEX.test(input.signature)) {
    throw new Error("Invalid signature format");
  }

  return {
    email: input.email.trim(),
    telegram: input.telegram.trim(),
    nonce: input.nonce,
    address: input.address.trim().toLowerCase(),
    signature: input.signature.trim(),
  };
};

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }
    const { email, telegram, nonce, address, signature } = parse(event.body);
    const lowerCaseAddress = address.toLowerCase() as `0x${string}`;
    // Note: this does NOT work for smart contract wallets, but viem's publicClient.verifyMessage() fails to verify atm.
    // https://viem.sh/docs/utilities/verifyTypedData.html
    const data = messages.contactDetails(address, nonce, telegram, email);
    const isValid = await verifyTypedData({
      ...data,
      signature,
    });
    if (!isValid) {
      // If the recovered address does not match the provided address, return an error
      throw new Error("Signature verification failed");
    }

    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_CLIENT_API_KEY!);

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
    if (error) {
      throw error;
    }
    return { statusCode: 200, body: JSON.stringify({ message: "Record updated successfully." }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: `Error: ${err}` }) };
  }
};
