import { Handler, HandlerEvent } from "@netlify/functions";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import amqp from "amqplib";
import busboy from "busboy";

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
  if (!event.body) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Invalid body format" }),
    };
  }

  const file = parseMultiPartData(event.body, event.headers);
  const s3Key = await uploadToS3(file["name"], file["parts"]);
  const cid = await getCID(s3Key);
  await rabbitMQUpload(cid);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: cid }),
  };
};

interface IFile {
  name: string;
  parts: Buffer[];
}

const parseMultiPartData = (
  body: string,
  headers: HandlerEvent["headers"]
): IFile => {
  const file: IFile = {
    name: "",
    parts: [],
  };

  const bb = busboy({ headers });

  bb.on("file", (_, filestream, metadata) => {
    file.name = metadata.filename;
    filestream.on("data", (data) => {
      file.parts.push(data);
    });
  });

  bb.write(Buffer.from(body, "base64").toString("utf8"));

  return file;
};

const validEnvVariables = (): boolean => {
  return Object.values(envVariables).reduce(
    (acc, current) => acc && typeof current !== "undefined",
    true
  );
};

interface IUploadedPart {
  ETag: string;
  PartNumber: number;
}

const uploadToS3 = async (name: string, parts: Buffer[]) => {
  const multipartInfo: AWS.S3.CreateMultipartUploadRequest = {
    Bucket: envVariables.bucketName!,
    Key: generateS3Path() + name,
  };
  const uploadID = await s3
    .createMultipartUpload(multipartInfo)
    .promise()
    .then((result) => result.UploadId);
  const uploadedParts: IUploadedPart[] = [];
  for (const [i, part] of parts.entries()) {
    const partNumber = i + 1;
    const partInfo: AWS.S3.UploadPartRequest = {
      ...multipartInfo,
      UploadId: uploadID!,
      Body: part,
      PartNumber: partNumber,
    };
    const test = await s3.uploadPart(partInfo).promise();
    uploadedParts.push({
      ETag: test.ETag!,
      PartNumber: partNumber,
    });
  }
  const completeMultipartUploadParams: AWS.S3.CompleteMultipartUploadRequest = {
    ...multipartInfo,
    MultipartUpload: {
      Parts: uploadedParts,
    },
    UploadId: uploadID!,
  };
  await s3.completeMultipartUpload(completeMultipartUploadParams).promise();

  return multipartInfo.Key;
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
