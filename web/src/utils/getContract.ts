import { utils } from "ethers";
import { Contract } from "@ethersproject/contracts";
import KlerosCore from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/KlerosCore.json";
import PNK from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/PNK.json";
import PolicyRegistry from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/PolicyRegistry.json";
import DisputeKitClassic from "@kleros/kleros-v2-contracts/deployments/arbitrumRinkeby/DisputeKitClassic.json";
import IArbitrable from "@kleros/kleros-v2-contracts/artifacts/src/arbitration/IArbitrable.sol/IArbitrable.json";
import IMetaEvidence from "@kleros/kleros-v2-contracts/artifacts/src/evidence/IMetaEvidence.sol/IMetaEvidence.json";

const CONTRACTS = {
  KlerosCore: KlerosCore,
  PNK: PNK,
  PolicyRegistry: PolicyRegistry,
  DisputeKitClassic: DisputeKitClassic,
  IArbitrable: IArbitrable,
  IMetaEvidence: IMetaEvidence,
};

export type ContractName = keyof typeof CONTRACTS;

export const getContract = (contractName: ContractName, address?: string) => {
  const contract = CONTRACTS[contractName];
  const contractInterface = new utils.Interface(contract["abi"]);
  const _address =
    typeof address !== "undefined" ? address : contract["address"];
  return _address ? new Contract(_address, contractInterface) : undefined;
};
