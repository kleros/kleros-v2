import { utils } from "ethers";
import { Contract } from "@ethersproject/contracts";
import ArbitrableExample from "@kleros/kleros-v2-contracts/deployments/rinkeby/ArbitrableExample.json";
import ForeignGatewayOnEthereum from "@kleros/kleros-v2-contracts/deployments/rinkeby/ForeignGatewayOnEthereum.json";
import FastBridgeReceiverOnEthereum from "@kleros/kleros-v2-contracts/deployments/rinkeby/FastBridgeReceiverOnEthereum.json";
import HomeGatewayToEthereum from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/HomeGatewayToEthereum.json";
import FastBridgeSenderToEthereum from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/FastBridgeSenderToEthereum.json";
import KlerosCore from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/KlerosCore.json";
import SafeBridgeSenderToEthereum from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/SafeBridgeSenderToEthereum.json";
import DisputeKitClassic from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/DisputeKitClassic.json";

const CONTRACTS = {
  ArbitrableExample: ArbitrableExample,
  DisputeKitClassic: DisputeKitClassic,
  ForeignGatewayOnEthereum: ForeignGatewayOnEthereum,
  FastBridgeReceiverOnEthereum: FastBridgeReceiverOnEthereum,
  FastBridgeSenderToEthereum: FastBridgeSenderToEthereum,
  HomeGatewayToEthereum: HomeGatewayToEthereum,
  KlerosCore: KlerosCore,
  SafeBridgeSenderToEthereum: SafeBridgeSenderToEthereum,
};

export type ContractName = keyof typeof CONTRACTS;

export const getContract = (contractName: ContractName) => {
  const contract = CONTRACTS[contractName];
  const contractInterface = new utils.Interface(contract["abi"]);
  const address = contract["address"];
  return new Contract(address, contractInterface);
};
