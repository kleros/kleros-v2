import { Handler } from "@netlify/functions";
import { File, FilebaseClient } from "@filebase/client";
import amqp, { Connection } from "amqplib";
import busboy from "busboy";

const { FILEBASE_TOKEN, RABBITMQ_URL, FILEBASE_API_WRAPPER } = process.env;
const filebase = new FilebaseClient({ token: FILEBASE_TOKEN ?? "" });

type FormElement =
  | { isFile: true; filename: string; mimeType: string; content: Buffer }
  | { isFile: false; content: string };
type FormData = { [key: string]: FormElement };

const emitRabbitMQLog = async (cid: string, operation: string) => {
  let connection: Connection | undefined;
  try {
    connection = await amqp.connect(RABBITMQ_URL ?? "");
    const channel = await connection.createChannel();

    await channel.assertExchange("ipfs", "topic");
    channel.publish("ipfs", operation, Buffer.from(cid));

    //eslint-disable-next-line no-console
    console.log(`Sent IPFS CID '${cid}' to exchange 'ipfs'`);
  } catch (err) {
    console.warn(err);
  } finally {
    if (typeof connection !== "undefined") await connection.close();
  }
};

const parseMultipart = ({ headers, body, isBase64Encoded }) =>
  new Promise<FormData>((resolve, reject) => {
    const fields: FormData = {};

    const bb = busboy({ headers });

    bb.on("file", (name, file, { filename, mimeType }) =>
      file.on("data", (content) => {
        fields[name] = { isFile: true, filename, mimeType, content };
      })
    )
      .on("field", (name, value) => {
        if (value) fields[name] = { isFile: false, content: value };
      })
      .on("close", () => resolve(fields))
      .on("error", (err) => reject(err));

    bb.write(body, isBase64Encoded ? "base64" : "binary");
    bb.end();
  });

const pinToFilebase = async (data: FormData, dapp: string, operation: string): Promise<Array<string>> => {
  const cids = new Array<string>();
  for (const [_, dataElement] of Object.entries(data)) {
    if (dataElement.isFile) {
      const { filename, mimeType, content } = dataElement;
      const path = `${filename}`;
      const cid = await filebase.storeDirectory([new File([content], path, { type: mimeType })]);
      await emitRabbitMQLog(cid, operation);
      cids.push(`ipfs://${cid}/${path}`);
    }
  }

  return cids;
};

export const handler: Handler = async (event) => {
  const { queryStringParameters } = event;

  if (
    !queryStringParameters ||
    !queryStringParameters.dapp ||
    !queryStringParameters.key ||
    !queryStringParameters.operation
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid query parameters" }),
    };
  }

  const { dapp, key, operation } = queryStringParameters;

  if (key !== FILEBASE_API_WRAPPER) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Invalid API key" }),
    };
  }

  try {
    const parsed = await parseMultipart(event);
    const cids = await pinToFilebase(parsed, dapp, operation);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File has been stored successfully",
        cids,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
