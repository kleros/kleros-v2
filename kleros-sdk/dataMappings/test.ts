import { expect } from "chai";
import { createPublicClient, http, parseAbiItem } from "viem";
import { arbitrumGoerli } from "viem/chains";
import { jsonAction, graphqlAction, fetchAction, eventAction, callAction } from "./dataMappings";
import { klerosCoreABI } from "../../web/src/hooks/contracts/generated";

const exampleObject = {
  evidence: {
    fileURI: {
      photo: "https://photo.url",
      video: "https://video.url",
    },
  },
};

const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

describe("jsonAction", () => {
  it("should extract and map data correctly", () => {
    const result = jsonAction(exampleObject, ["photo", "video"], ["photoUrl", "videoUrl"]);
    expect(result).to.eql({
      photoUrl: "https://photo.url",
      videoUrl: "https://video.url",
    });
  });
});

describe("fetchAction", () => {
  it("should fetch data and return in expected format", async () => {
    const seek = ["rate"];
    const populate = ["rate"];
    const result = await fetchAction("https://fakestoreapi.com/products/1", seek, populate);

    const expectedResult = {
      rate: 3.9,
    };

    expect(result).to.eql(expectedResult);
  });
});

describe("graphqlAction", () => {
  it("should fetch GraphQL data and return in expected format", async () => {
    const seek = ["courts"];
    const populate = ["courts"];

    const mockQuery = `
      {
        courts(first: 1) {
          id
          stakedJurors(first:1){
            court {
              id
            }
          }
        }
      }
    `;

    const mockData = {
      courts: [
        {
          id: "1",
          stakedJurors: [
            {
              court: {
                id: "1",
              },
            },
          ],
        },
      ],
    };

    const result = await graphqlAction(mockQuery, seek, populate);
    expect(result).to.eql(mockData);
  });
});

describe("callAction", () => {
  it("should call the contract and return populated data", async () => {
    const mockAbi = parseAbiItem(`function appealCost(uint256 _disputeID) public view returns (uint256)`);
    const mockInputs = ["0x5a2bC1477ABE705dB4955Cda7DE064eA79D563d1", BigInt(1)];
    const mockSeek = ["appealCost"];
    const mockPopulate = ["cost"];

    const result = await callAction(mockAbi, mockInputs, mockSeek, mockPopulate);

    console.log("result", result);
    expect(result).to.eql({
      cost: BigInt(30000000000000),
    });
  });
});

describe("eventAction", () => {
  it("should fetch event data and return populated data", async () => {
    const mockSource = parseAbiItem(
      "event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _roundID, uint256 _voteID)"
    );
    const mockInputs = ["0x5a2bC1477ABE705dB4955Cda7DE064eA79D563d1", BigInt(40250621)];
    const mockSeek = ["_address", "_disputeID"];
    const mockPopulate = ["address", "disputeID"];
    const mockEventData = {
      eventItem1: "eventData1",
      eventItem2: "eventData2",
    };

    const result = await eventAction(mockSource, mockInputs, mockSeek, mockPopulate);
    // console.log("🚀 ~ file: test.ts:108 ~ it ~ result:", result);
    expect(result).to.eql({
      address: "0xaeaD6593710Bf28bF4848b24F4ed1F130773d7E6",
      disputeID: BigInt(42),
    });
  });
});
