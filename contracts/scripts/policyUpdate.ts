import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
import { PolicyRegistry } from "../typechain-types";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
const path = require("path");

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
    const json = JSON.parse(jsonString);
    courtsV1 = json.map((courtDetails) => ({
      ...courtDetails,
      name: courtDetails.name,
      description: courtDetails.description,
      summary: courtDetails.summary,
      court: courtDetails.court,
      uri: courtDetails.uri,
    }));
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

  //--------uncomment once configuration is set in deployments------
  // const policyRegistryDeployment = await deployments.get("PolicyRegistry");
  const policyRegistry = (await ethers.getContractAt(
    "PolicyRegistry",
    "0xAF0F49Fe110b48bd512F00d51D141F023c9a9106" // arbitrumgoerli contract address
    // policyRegistryDeployment.address
  )) as PolicyRegistry;
  for (const courtObject of courtsV1) {
    var courtV2 = courtObject.court + 1;
    var filename = courtObject.name.replace(" ", "-").concat(".json");
    const formData = await constructData(courtObject, filename);
    let response = await uploadFormDataToIPFS(formData);
    if (response && response.statusCode === 200) {
      try {
        console.log(courtV2, courtObject.name);
        const data = await JSON.parse(response.body);
        const cid = "/ipfs/" + data["cid"];
        console.log(cid, "cid");
        await policyRegistry.connect(governor).setPolicy(courtV2, courtObject.name, cid);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

const constructData = async (courtObj: any, filename: string) => {
  const formData = new FormData();
  fs.writeFileSync(
    "./scripts/courtObjects/" + filename.toString(),
    JSON.stringify({ name: courtObj.name, description: courtObj.description, summary: courtObj.summary }, null, "\t")
  );
  const RelativePath = path.join(__dirname, "./courtObjects/" + filename.toString());
  formData.append("data", fs.createReadStream(RelativePath));
  formData.append("filename", filename);
  return formData;
};

const uploadFormDataToIPFS = async (data: FormData) => {
  const ESTUARY_URL = process.env.ESTUARY_URL;
  let auth = `Bearer ${process.env.ESTUARY_KEY}`;
  try {
    const response = await fetch(ESTUARY_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: auth,
      },
      body: data,
    });
    let parseResponse = await response.json();
    console.log(parseResponse, "parse response");
    return {
      statusCode: response.status,
      body: JSON.stringify(parseResponse),
    };
  } catch (error) {
    console.log(error);
  }
};
main("./config/policies.v1.mainnet.json")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
