import { expect } from "chai";
import { createPublicClient, http, parseAbiItem } from "viem";
import { arbitrumGoerli } from "viem/chains";
import { jsonAction, graphqlAction, fetchAction, eventAction, callAction } from "./dataMappings";
import { klerosCoreABI } from "../../web/src/hooks/contracts/generated";

const currentAcc = {
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
    const result = jsonAction(currentAcc, "evidence.fileURI", ["photo", "video"], ["photoUrl", "videoUrl"]);
    expect(result).to.eql({
      photoUrl: "https://photo.url",
      videoUrl: "https://video.url",
    });
  });
});

describe("fetchAction", () => {
  it("should fetch data and return in expected format", async () => {
    const result = await fetchAction("product", "https://fakestoreapi.com/products/1");
    expect(result).to.eql({
      product: {
        id: 1,
        title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        price: 109.95,
        description:
          "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        rating: {
          rate: 3.9,
          count: 120,
        },
      },
    });
  });
});

describe("graphqlAction", () => {
  it("should fetch GraphQL data and return in expected format", async () => {
    const mockQuery = `
      {
        court(id: 1) {
          id
        }
      }
    `;

    const mockData = {
      court: {
        id: "1",
      },
    };

    const result = await graphqlAction("court", mockQuery);
    expect(result).to.eql({ court: mockData });
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
