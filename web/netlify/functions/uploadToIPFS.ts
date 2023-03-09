import { Handler } from "@netlify/functions";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import amqp from "amqplib";

const envVariables = {
  accessKey: process.env.FILEBASE_ACCESS_KEY,
  secretKey: process.env.FILEBASE_SECRET_KEY,
  bucketName: process.env.FILEBASE_BUCKET_NAME,
  rabbitMQURL: process.env.RABBITMQ_URL,
};

const s3 = new AWS.S3({
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  signatureVersion: "v4",
  accessKeyId: envVariables.accessKey,
  secretAccessKey: envVariables.secretKey,
});

export const handler: Handler = async function (event) {
  if (!validEnvVariables()) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Env variables missing" }),
    };
  }
  if (!event.body || typeof event.headers["file-name"] === "undefined") {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Invalid body format" }),
    };
  }

  const s3Key = await uploadToS3(event.headers["file-name"]!, event.body).then(
    (result) => result.Key
  );
  const cid = await getCID(s3Key);
  await rabbitMQUpload(cid);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: cid }),
  };
};

const validEnvVariables = (): boolean => {
  return Object.values(envVariables).reduce(
    (acc, current) => acc && typeof current !== "undefined",
    true
  );
};

const uploadToS3 = (fileName: string, body: string) => {
  const params: AWS.S3.PutObjectRequest = {
    Bucket: envVariables.bucketName!,
    Key: generateS3Path() + fileName,
    ContentType: "text/plain",
    Body: body,
  };
  return s3.upload(params).promise();
};

const getCID = async (key: string) => {
  const headParams: AWS.S3.HeadObjectRequest = {
    Bucket: envVariables.bucketName!,
    Key: key,
  };
  const head = await s3.headObject(headParams).promise();

  return head.Metadata?.cid;
};

const generateS3Path = (): string => {
  const currentDate = new Date();
  const formattedDate = currentDate
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "/");
  const id = uuidv4();
  return `${formattedDate}/${id}/`;
};

const rabbitMQUpload = async (cid: any) => {
  const conn = await amqp.connect(envVariables.rabbitMQURL!);
  const channel = await conn.createChannel();
  const exchange = "filebase";
  await channel.assertExchange(exchange, "fanout", { durable: true });
  channel.publish(exchange, "", Buffer.from(cid));
  await channel.close();
  await conn.close();
};
