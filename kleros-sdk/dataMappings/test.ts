import { expect } from "chai";
import { jsonAction, graphqlAction, eventAction, callAction, findNestedKey, populateTemplate, configureSDK } from ".";

const exampleObject = {
  evidence: {
    fileURI: {
      photo: "https://photo.url",
      video: "https://video.url",
    },
  },
};

before(() => {
  configureSDK({ apiKey: process.env.ALCHEMY_API_KEY });
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

describe("graphqlAction", () => {
  it("should fetch GraphQL data and return in expected format", async () => {
    const mockEndpoint = "https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli";
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

    const result = await graphqlAction(mockEndpoint, mockQuery, seek, populate);
    expect(result).to.eql(mockData);
  });
});

describe("callAction", () => {
  it("should call the contract and return populated data", async () => {
    const mockAbi = "function appealCost(uint256 _disputeID) public view returns (uint256)";
    const mockInputs = ["0x5a2bC1477ABE705dB4955Cda7DE064eA79D563d1", "appealCost", BigInt(1)];
    const mockSeek = ["_disputeID"];
    const mockPopulate = ["cost"];

    const result = await callAction(mockAbi, mockInputs, mockSeek, mockPopulate);

    expect(result).to.eql({
      cost: BigInt(30000000000000),
    });
  });
});

describe("eventAction", () => {
  it("should fetch event data and return populated data", async () => {
    const mockSource = "event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount)";
    const mockInputs = [
      "0x5a2bC1477ABE705dB4955Cda7DE064eA79D563d1",
      BigInt(36205881),
      "0xE652E5B6409B062FcE5f40E19682f31152d6CD1a",
    ];
    const mockSeek = ["_address", "_courtID"];
    const mockPopulate = ["address", "courtID"];

    const result = await eventAction(mockSource, mockInputs, mockSeek, mockPopulate);
    expect(result).to.eql({
      address: "0xE652E5B6409B062FcE5f40E19682f31152d6CD1a",
      courtID: BigInt(1),
    });
  });
});

describe("findNestedKey", () => {
  const testData = {
    level1: "value1",
    nested: {
      level2: "value2",
      deeper: {
        level3: "value3",
      },
    },
  };

  it("should find top-level keys", () => {
    const result = findNestedKey(testData, "level1");
    expect(result).to.eql("value1");
  });

  it("should find second-level nested keys", () => {
    const result = findNestedKey(testData, "level2");
    expect(result).to.eql("value2");
  });

  it("should find deeply nested keys", () => {
    const result = findNestedKey(testData, "level3");
    expect(result).to.eql("value3");
  });

  it("should return null if key not found", () => {
    const result = findNestedKey(testData, "nonexistent");
    expect(result).to.be.null;
  });
});

describe("populateTemplate", () => {
  it("should correctly populate the template with provided data", () => {
    const template = '{"name": "{{name}}", "age": {{age}}, "isStudent": {{isStudent}}}';
    const data = {
      name: "John",
      age: 25,
      isStudent: false,
    };

    const result = populateTemplate(template, data);

    expect(result).to.deep.equal({
      name: "John",
      age: 25,
      isStudent: false,
    });
  });

  it("should handle missing data by leaving placeholders untouched", () => {
    const template = '{"name": "{{name}}", "age": {{age}}}';
    const data = {
      age: 30,
    };

    const result = populateTemplate(template, data);

    expect(result).to.deep.equal({
      name: "",
      age: 30,
    });
  });

  it("should throw an error for invalid JSON", () => {
    const template = '{"name": "{{name}"}';
    const data = {
      name: "Jane",
    };

    expect(() => populateTemplate(template, data)).to.throw();
  });
});
