import React from "react";

import Identicon from "react-identicons";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useChainId, useEnsAvatar, useEnsName } from "wagmi";

import { getChain } from "consts/chains";
import { cn } from "utils/cn";
import { shortenAddress } from "utils/shortenAddress";

interface IIdenticonOrAvatar {
  size?: `${number}`;
  address?: `0x${string}`;
}

export const IdenticonOrAvatar: React.FC<IIdenticonOrAvatar> = ({ size = "20", address: propAddress }) => {
  const { address: defaultAddress } = useAccount();
  const address = propAddress || defaultAddress;

  const { data: name } = useEnsName({
    address,
    chainId: 1,
  });
  const { data: avatar } = useEnsAvatar({
    name: normalize(name ?? ""),
    chainId: 1,
  });

  return avatar ? (
    <img
      className="items-center rounded-full object-cover"
      src={avatar}
      alt="avatar"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  ) : (
    <Identicon className="items-center" size={Number(size)} string={address} />
  );
};

interface IAddressOrName {
  address?: `0x${string}`;
  smallDisplay?: boolean;
}

export const AddressOrName: React.FC<IAddressOrName> = ({ address: propAddress, smallDisplay }) => {
  const { address: defaultAddress } = useAccount();
  const address = propAddress || defaultAddress;

  const { data } = useEnsName({
    address,
    chainId: 1,
  });

  const content = data ?? (isAddress(address!) ? shortenAddress(address) : address);

  return smallDisplay ? <label className="text-[14px]!">{content}</label> : <label>{content}</label>;
};

export const ChainDisplay: React.FC = () => {
  const chainId = useChainId();
  const chain = getChain(chainId);
  return <label>{chain?.name}</label>;
};

const AccountDisplay: React.FC = () => {
  const { address } = useAccount();
  return (
    <button
      className={cn(
        "flex h-auto cursor-pointer flex-row items-center gap-2 rounded-[300px] border-0",
        "bg-klerosUIComponentsLightGrey px-3 py-0 [transition:background-color_0.1s]",
        "hover:bg-klerosUIComponentsStroke lg:gap-0 lg:bg-klerosUIComponentsWhiteLowOpacitySubtle",
        "lg:hover:bg-klerosUIComponentsWhiteLowOpacityStrong lg:hover:[&_label]:text-white!",
        "lg:hover:[&_label]:[transition:color_0.2s]"
      )}
      aria-label={address}
    >
      <div
        className={cn(
          "flex min-h-8 w-fit items-center gap-3 [&>label]:text-[14px] [&>label]:font-normal",
          "lg:[&>label]:text-[#ffffffcc]!"
        )}
      >
        <IdenticonOrAvatar size="20" />
        <AddressOrName />
      </div>
    </button>
  );
};

export default AccountDisplay;
