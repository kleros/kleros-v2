import chai from "chai";
import { solidity } from "ethereum-waffle";
import { chaiEthers } from "chai-ethers";

chai.use(solidity);
chai.use(chaiEthers);

export = chai;
