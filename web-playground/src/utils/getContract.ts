import { utils } from "ethers";
import { Contract } from "@ethersproject/contracts";
import ForeignGateway from "@kleros/kleros-v2-contracts/deployments/rinkeby/ForeignGateway.json";
import FastBridgeReceiver from "@kleros/kleros-v2-contracts/deployments/rinkeby/FastBridgeReceiver.json";
import HomeGateway from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/HomeGateway.json";
import FastBridgeSender from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/FastBridgeSender.json";
import KlerosCore from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/KlerosCore.json";
import SafeBridgeArbitrum from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/SafeBridgeArbitrum.json";

const CONTRACTS = {
  ForeignGateway: ForeignGateway,
  FastBridgeReceiver: FastBridgeReceiver,
  HomeGateway: HomeGateway,
  FastBridgeSender: FastBridgeSender,
  KlerosCore: KlerosCore,
  SafeBridgeArbitrum: SafeBridgeArbitrum,
};

export type ContractName = keyof typeof CONTRACTS;

export const getContract = (contractName: ContractName) => {
  const contract = CONTRACTS[contractName];
  const contractInterface = new utils.Interface(contract["abi"]);
  const address = contract["address"];
  return new Contract(address, contractInterface);
};
