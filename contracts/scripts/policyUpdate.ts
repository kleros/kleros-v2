import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
import { PolicyRegistry } from "../typechain-types";
import fs from "fs";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  signatureVersion: "v4",
  accessKeyId: process.env.FILEBASE_ACCESS_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
});
enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}
async function main(filePath: string) {
  let courtsV1;
  fs.readFile(filePath, "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    courtsV1 = JSON.parse(jsonString);
  });

  // fallback to hardhat node signers on local network
  // const governor = (await getNamedAccounts()).governor ?? (await ethers.getSigners())[0].address;
  const governor = (await ethers.getSigners())[0];
  const chainId = Number(await getChainId());
  if (!HomeChains[chainId]) {
    console.error(`Aborting: script is not compatible with ${chainId}`);
    return;
  } else {
    console.log("deploying to %s with deployer %s", HomeChains[chainId], governor);
  }
  const policyRegistryDeployment = await deployments.get("PolicyRegistry");
  const policyRegistry = (await ethers.getContractAt(
    "PolicyRegistry",
    policyRegistryDeployment.address
  )) as PolicyRegistry;
  for (const courtObject of courtsV1) {
    var courtV2 = courtObject.court + 1;
    var filename = courtObject.name.replace(" ", "-").concat(".json");
    const data = { name: courtObject.name, description: courtObject.description, summary: courtObject.summary };
    let response = await uploadDataToIPFS(data, filename);
    console.log(response);

    if (response && response.statusCode === 200) {
      try {
        console.log(courtV2, courtObject.name);
        const data = await JSON.parse(response.body);
        const ipfsPath = "/ipfs/" + data.message.Metadata.cid;
        await policyRegistry.connect(governor).setPolicy(courtV2, courtObject.name, ipfsPath);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

const uploadDataToIPFS = async (data, filename) => {
  try {
    const params = {
      Bucket: process.env.FILEBASE_BUCKET_NAME,
      Key: generateS3Path() + filename,
      ContentType: "application/json",
      Body: Buffer.from(JSON.stringify(data)),
    };
    const request = await s3.upload(params).promise();

    const head_params = {
      Bucket: process.env.FILEBASE_BUCKET_NAME,
      Key: request.key,
    };
    const head = await s3.headObject(head_params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: head }),
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};
const generateS3Path = (): string => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, "/");
  const id = uuidv4();
  return `${formattedDate}/${id}/`;
};
main("./config/policies.v1.mainnet.json")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
