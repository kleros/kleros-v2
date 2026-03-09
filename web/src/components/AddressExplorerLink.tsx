import React from "react";

import { Address } from "viem";

import { shortenAddress } from "utils/shortenAddress";

import { getAddressExplorerLink } from "src/utils";

import { ExternalLink } from "./ExternalLink";

interface IAddressExplorerLink {
  address: Address;
}

/**
 * @description Renders a link of the Address to the relevant explorer
 * @param address Address to be displayed
 */
const AddressExplorerLink: React.FC<IAddressExplorerLink> = ({ address }) => {
  return (
    <ExternalLink to={getAddressExplorerLink(address)} target="_blank" rel="noopener noreferrer">
      {shortenAddress(address)}
    </ExternalLink>
  );
};
export default AddressExplorerLink;
