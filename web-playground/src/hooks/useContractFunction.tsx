import React from "react";
import {
  useEthers,
  getChainById,
  useContractFunction as _useContractFunction,
  TransactionStatus,
  ArbitrumRinkeby,
  Rinkeby,
} from "@usedapp/core";
import { LogDescription } from "@ethersproject/abi";
import { Button } from "@kleros/ui-components-library";
import { getContract, ContractName } from "../utils/getContract";
import { useSwitchNetwork } from "./useSwitchNetwork";
import ETHLogo from "svgs/ethereum-eth-logo.svg";
import ArbitrumLogo from "svgs/arbitrum_opacity.svg";
export type { ContractName };

interface ISendWithSwitch {
  text: string;
  disabled: boolean;
  onClick: () => void;
  correctChain: boolean;
  destinationChain?: number;
  className?: string;
  small?: boolean;
}

const SendWithSwitch: React.FC<ISendWithSwitch> = ({
  text,
  disabled,
  onClick,
  small,
  correctChain,
  destinationChain,
  className,
}) => {
  const switchNetwork = useSwitchNetwork();
  const chain = destinationChain && getChainById(destinationChain);
  return (
    <Button
      {...{ small, disabled, className }}
      text={correctChain ? text : "Switch Network"}
      icon={(classNameIcon: string) =>
        chain === ArbitrumRinkeby ? (
          <ArbitrumLogo {...{ className: classNameIcon }} />
        ) : chain === Rinkeby ? (
          <ETHLogo {...{ className: classNameIcon }} />
        ) : undefined
      }
      onClick={
        correctChain
          ? () => onClick()
          : async () => chain && (await switchNetwork(chain))
      }
    />
  );
};

type ISendWithSwitchFunction = Omit<
  Omit<ISendWithSwitch, "correctChain">,
  "destinationChain"
>;

export const useContractFunction = (
  contractName: ContractName,
  functionName: string,
  options?: {
    chainId?: number;
    transactionName?: string;
  }
): {
  send: (...args: any[]) => void;
  sendWithSwitch: (props: ISendWithSwitchFunction) => React.ReactElement;
  state: TransactionStatus;
  events: LogDescription[] | undefined;
} => {
  const { chainId: walletChainId } = useEthers();
  const contract = getContract(contractName);
  const { send, state, events } = _useContractFunction(contract, functionName, {
    transactionName: options?.transactionName,
  });
  const sendWithSwitch = (props: ISendWithSwitchFunction) => (
    <SendWithSwitch
      {...props}
      correctChain={options?.chainId ? walletChainId === options.chainId : true}
      destinationChain={options?.chainId}
    />
  );
  return {
    send,
    sendWithSwitch,
    state,
    events,
  };
};
