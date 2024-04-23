import React from "react";

import DaiIcon from "svgs/tokens/dai.svg";
import EthIcon from "svgs/tokens/eth.svg";
import PnkIcon from "svgs/tokens/pnk.svg";
import UsdcIcon from "svgs/tokens/usdc.svg";

import StyledDropdown from "../StyledDropdown";

// get these from the aggregator sdk we will use ?
const supportedTokens = [
  { value: "PNK", text: "PNK", Icon: PnkIcon },
  { value: "ETH", text: "ETH", Icon: EthIcon },
  { value: "DAI", text: "DAI", Icon: DaiIcon },
  { value: "USDC", text: "USDC", Icon: UsdcIcon },
];

// get this from aggregator sdk
export type Token = {
  token: string;
  chainId: number;
  logoUri: string;
};
interface ITokenSelect {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}
const TokenSelect: React.FC<ITokenSelect> = ({ token, setToken }) => (
  <StyledDropdown
    smallButton
    defaultValue={token}
    callback={(val) => setToken(val.toString())}
    items={supportedTokens}
  />
);

export default TokenSelect;
