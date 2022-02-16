import {
  useEthers,
  getChainById,
  useContractFunction as _useContractFunction,
  TransactionStatus,
} from "@usedapp/core";
import { LogDescription } from "@ethersproject/abi";
import { getContract, ContractName } from "../utils/getContract";
import { useSwitchNetwork } from "./useSwitchNetwork";

export type { ContractName };

export const useContractFunction = (
  contractName: ContractName,
  functionName: string,
  options?: {
    chainId?: number;
    transactionName?: string;
  }
): {
  send: (...args: any[]) => void;
  sendWithSwitch: (...args: any[]) => void;
  state: TransactionStatus;
  events: LogDescription[] | undefined;
} => {
  const { chainId: walletChainId } = useEthers();
  const contract = getContract(contractName);
  const { send, state, events } = _useContractFunction(contract, functionName, {
    transactionName: options?.transactionName,
  });
  let correctChain = true;
  const switchNetwork = useSwitchNetwork();
  const sendWithSwitch = async (...args: any[]) => {
    if (options?.chainId) {
      if (walletChainId !== options.chainId) {
        const destinationChain = getChainById(options.chainId);
        if (destinationChain) {
          await switchNetwork(destinationChain).catch(() => {
            correctChain = false;
          });
        }
      }
    }
    if (correctChain) {
      send(...args).catch((error) => {
        console.error(error);
      });
    }
  };
  return {
    send,
    sendWithSwitch,
    state,
    events,
  };
};
