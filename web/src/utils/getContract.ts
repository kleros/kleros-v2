import { utils } from "ethers";
import { Contract } from "@ethersproject/contracts";
import KlerosCore from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/KlerosCore.json";
import PolicyRegistry from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/PolicyRegistry.json";
import IArbitrable from "@kleros/kleros-v2-contracts/artifacts/src/arbitration/IArbitrable.sol/IArbitrable.json";
import IMetaEvidence from "@kleros/kleros-v2-contracts/artifacts/src/evidence/IMetaEvidence.sol/IMetaEvidence.json";

const CONTRACTS = {
  KlerosCore: KlerosCore,
  PolicyRegistry: PolicyRegistry,
  IArbitrable: IArbitrable,
  IMetaEvidence: IMetaEvidence,
};

export type ContractName = keyof typeof CONTRACTS;

export const getContract = (contractName: ContractName, address?: string) => {
  const contract = CONTRACTS[contractName];
  const contractInterface = new utils.Interface(contract["abi"]);
  const _address = typeof address !== undefined ? address : contract["address"];
  return _address ? new Contract(_address, contractInterface) : undefined;
};
