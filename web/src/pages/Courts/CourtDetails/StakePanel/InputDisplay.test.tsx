import React, { useState } from "react";

import { screen, waitFor } from "@testing-library/react";
import { parseUnits } from "viem";
import { describe, it, expect } from "vitest";

import { DEFAULT_CHAIN } from "consts/chains";
import {
  klerosCoreAbi,
  klerosCoreAddress,
  pnkAbi,
  pnkAddress,
  sortitionModuleAbi,
  sortitionModuleAddress,
} from "hooks/contracts/generated";

import { aCourtDetails } from "src/test/builders";
import type { ReadMock } from "src/test/msw/rpc";
import { server } from "src/test/msw/server";
import { subgraphHandler } from "src/test/msw/subgraph";
import { renderWithProviders } from "src/test/renderWithProviders";

import InputDisplay from "./InputDisplay";
import { ActionType } from "./StakeWithdrawButton";

const chainId = DEFAULT_CHAIN.id;
const pnk = (amount: string) => parseUnits(amount, 18);

interface Wallet {
  balance: bigint;
  stakedInCourt: bigint;
  allowance?: bigint;
}

const walletReads = ({ balance, stakedInCourt, allowance = pnk("1000000") }: Wallet): ReadMock[] => [
  { address: pnkAddress[chainId], abi: pnkAbi, functionName: "balanceOf", result: () => balance },
  { address: pnkAddress[chainId], abi: pnkAbi, functionName: "allowance", result: () => allowance },
  {
    address: sortitionModuleAddress[chainId],
    abi: sortitionModuleAbi,
    functionName: "getJurorBalance",
    result: () => [stakedInCourt, 0n, stakedInCourt, stakedInCourt > 0n ? 1n : 0n],
  },
  // eth_call simulation of setStake succeeds; the function returns nothing.
  { address: klerosCoreAddress[chainId], abi: klerosCoreAbi, functionName: "setStake", result: () => undefined },
];

const Harness: React.FC<{ action: ActionType }> = ({ action }) => {
  const [amount, setAmount] = useState("");
  return <InputDisplay {...{ action, amount, setAmount }} />;
};

const renderStakePanel = (action: ActionType, wallet: Wallet, minStake = pnk("200")) => {
  server.use(subgraphHandler({ court: () => aCourtDetails({ minStake: minStake.toString() }) }).handler);
  return renderWithProviders(<Harness action={action} />, {
    route: "/courts/1/stake",
    path: "/courts/:id/*",
    reads: walletReads(wallet),
  });
};

const typeAmount = async (user: ReturnType<typeof renderWithProviders>["user"], placeholder: string, value: string) => {
  await user.click(screen.getByPlaceholderText(placeholder));
  await user.type(screen.getByPlaceholderText(placeholder), value);
};

describe("StakePanel InputDisplay", () => {
  it("shows the wallet balance and fills it with Stake all", async () => {
    const { user } = renderStakePanel(ActionType.stake, { balance: pnk("1234.9"), stakedInCourt: 0n });

    expect(await screen.findByText("Available 1,234 PNK")).toBeInTheDocument();
    await user.click(screen.getByText("Stake all"));

    expect(screen.getByRole("spinbutton", { name: "Amount to stake" })).toHaveAttribute("aria-valuenow", "1234");
  });

  it("refuses to stake more than the wallet holds", async () => {
    const { user } = renderStakePanel(ActionType.stake, { balance: pnk("1000"), stakedInCourt: 0n });
    await screen.findByText("Available 1,000 PNK");

    await typeAmount(user, "Amount to stake", "1500");

    expect(await screen.findByText("Insufficient balance to stake this amount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stake" })).toBeDisabled();
  });

  it("asks for PNK when the wallet is empty", async () => {
    const { user } = renderStakePanel(ActionType.stake, { balance: 0n, stakedInCourt: 0n });
    await screen.findByText("Available 0 PNK");

    await typeAmount(user, "Amount to stake", "10");

    expect(await screen.findByText("You need a non-zero PNK balance to stake")).toBeInTheDocument();
  });

  it("enforces the court minimum stake on the resulting stake", async () => {
    const { user } = renderStakePanel(ActionType.stake, { balance: pnk("1000"), stakedInCourt: 0n }, pnk("200"));
    await screen.findByText("Available 1,000 PNK");

    await typeAmount(user, "Amount to stake", "100");

    expect(await screen.findByText("Min Stake in court is: 200 PNK")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stake" })).toBeDisabled();
  });

  it("counts the existing stake towards the court minimum", async () => {
    const { user } = renderStakePanel(
      ActionType.stake,
      { balance: pnk("1000"), stakedInCourt: pnk("150") },
      pnk("200")
    );
    await screen.findByText("Available 1,000 PNK");

    await typeAmount(user, "Amount to stake", "100");

    await waitFor(() => expect(screen.getByRole("button", { name: "Stake" })).toBeEnabled());
    expect(screen.queryByText(/Min Stake in court/)).not.toBeInTheDocument();
  });

  it("refuses to withdraw more than is staked in the court", async () => {
    const { user } = renderStakePanel(ActionType.withdraw, { balance: pnk("1000"), stakedInCourt: pnk("300") });
    expect(await screen.findByText("Available 300 PNK")).toBeInTheDocument();

    await typeAmount(user, "Amount to withdraw", "301");

    expect(await screen.findByText("Insufficient staked amount to withdraw this amount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeDisabled();
  });
});
