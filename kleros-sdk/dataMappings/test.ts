import { expect } from "chai";
import { createPublicClient, http } from "viem";
import { arbitrumGoerli } from "viem/chains";
import { jsonAction, graphqlAction, fetchAction, callAction } from "./dataMappings";
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

// describe("callAction", () => {
//   it("should call the contract and return populated data", async () => {
//     const mockAbi = klerosCoreABI;
//     const mockInputs = ["0x5a2bC1477ABE705dB4955Cda7DE064eA79D563d1"]; // Add the contract address as an input
//     const mockSeek = ["pinakion"]; // Adjusting this to seek for 'pinakion'
//     const mockPopulate = ["result1", "tokenAddress"]; // Changing 'result2' to 'tokenAddress' to be more descriptive

//     const result = await callAction(mockAbi, mockInputs, mockSeek, mockPopulate);

//     console.log(result);
//     expect(result).to.eql({
//       result1: "data1",
//       tokenAddress: "0x4deeefd054434bf6721ef39aa18efb3fd0d12610",
//     });
//   });
// });

// describe("eventAction", () => {
//   let createEventFilterStub;
//   let getFilterLogsStub;

//   beforeEach(() => {
//     // Mock the methods from publicClient
//     createEventFilterStub = sinon.stub(publicClient, "createEventFilter");
//     getFilterLogsStub = sinon.stub(publicClient, "getFilterLogs");
//   });

//   afterEach(() => {
//     // Restore the mocked methods
//     createEventFilterStub.restore();
//     getFilterLogsStub.restore();
//   });

//   it("should fetch event data and return populated data", async () => {
//     const mockSource = "contractEvent";
//     const mockInputs = [];
//     const mockSeek = ["eventItem1", "eventItem2"];
//     const mockPopulate = ["result1", "result2"];
//     const mockEventData = {
//       eventItem1: "eventData1",
//       eventItem2: "eventData2",
//     };

//     const mockFilter = {}; // dummy filter for this test
//     const mockContractEvent = [{ args: mockEventData }];

//     // Mock the return values
//     createEventFilterStub.resolves(mockFilter);
//     getFilterLogsStub.resolves(mockContractEvent);

//     const result = await eventAction(mockSource, mockInputs, mockSeek, mockPopulate);
//     expect(result).to.eql({
//       result1: "eventData1",
//       result2: "eventData2",
//     });
//   });
// });
