import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import {
  Web3Provider as EthersProvider,
  ExternalProvider,
} from "@ethersproject/providers";

const getLibrary = (provider: ExternalProvider): EthersProvider =>
  new EthersProvider(provider);

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Web3ReactProvider {...{ getLibrary }}> {children} </Web3ReactProvider>;

export default Web3Provider;
