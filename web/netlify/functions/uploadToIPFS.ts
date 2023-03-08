const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const id = uuidv4();
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}/${(
  currentDate.getMonth() + 1
)
  .toString()
  .padStart(2, "0")}/${currentDate.getDate().toString().padStart(2, "0")}`;
const S3_PATH = formattedDate + "/" + id + "/";
const amqp = require("amqplib");

const s3 = new AWS.S3({
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  signatureVersion: "v4",
  accessKeyId: process.env.FILEBASE_ACCESS_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
});

export const handler = async function (event: any, context: any) {
  if (event.body) {
    const params = {
      Bucket: process.env.FILEBASE_BUCKET_NAME,
      Key: S3_PATH + event.headers["file-name"],
      ContentType: "text/plain",
      Body: event["body"],
    };
    const request = await s3.upload(params).promise();
    const head_params = {
      Bucket: process.env.FILEBASE_BUCKET_NAME,
      Key: request.key,
    };
    const head = await s3.headObject(head_params).promise();
    await rabbitMQUpload(head.Metadata.cid);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: head.Metadata.cid }),
    };
  }
  return {
    statusCode: 500,
    body: JSON.stringify({ message: "Invalid body format" }),
  };
};

const rabbitMQUpload = async (cid: any) => {
  // Connect to RabbitMQ
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();
  const exchange = "filebase";
  await channel.assertExchange(exchange, "fanout", { durable: true });
  // Publish the IPFS CID to the exchange
  channel.publish(exchange, "", Buffer.from(cid));
  console.log(`Sent IPFS CID ${cid} to exchange ${exchange}`);
  // Close the connection and return success
  await channel.close();
  await conn.close();
};
