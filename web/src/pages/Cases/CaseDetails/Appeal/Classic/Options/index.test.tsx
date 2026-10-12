import React from "react";

import { screen, waitFor, within } from "@testing-library/react";
import { formatEther, parseEther } from "viem";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreAbi, klerosCoreAddress } from "hooks/contracts/generated";
import { ClassicAppealProvider } from "hooks/useClassicAppealContext";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { DISPUTE_KIT_REGISTRY } from "src/dispute-kits/registry";
import { Period } from "src/graphql/graphql";
import {
  aClassicAnswer,
  aClassicDisputeKitDispute,
  aClassicLocalRound,
  aDisputeDetails,
  aDisputeDetailsRound,
  aPopulatedDispute,
  DEFAULT_TIMES_PER_PERIOD,
  T0,
} from "src/test/builders";
import { TEST_URLS } from "src/test/env";
import type { ReadMock } from "src/test/msw/rpc";
import { server } from "src/test/msw/server";
import { subgraphHandler } from "src/test/msw/subgraph";
import { renderWithProviders } from "src/test/renderWithProviders";

import Options from "./index";

const classicKit = DISPUTE_KIT_REGISTRY[DisputeKits.Classic];
const APPEAL_COST = parseEther("0.1");
// Winner pays 50% on top of the appeal cost, loser 100%; the loser gets half the appeal period.
const WINNER_REQUIRED = parseEther("0.15");
const LOSER_REQUIRED = parseEther("0.2");
const APPEAL_PERIOD = Number(DEFAULT_TIMES_PER_PERIOD[3]);

const reads: ReadMock[] = [
  {
    address: klerosCoreAddress[DEFAULT_CHAIN.id],
    abi: klerosCoreAbi,
    functionName: "appealCost",
    result: () => APPEAL_COST,
  },
  ...(
    [
      ["WINNER_STAKE_MULTIPLIER", 5000n],
      ["LOSER_STAKE_MULTIPLIER", 10000n],
      ["LOSER_APPEAL_PERIOD_MULTIPLIER", 5000n],
    ] as const
  ).map(([functionName, value]) => ({
    address: classicKit.address,
    abi: classicKit.disputeKitAbi,
    functionName,
    result: () => value,
  })),
];

type LocalRound = Parameters<typeof aClassicLocalRound>[0];

/** Serves the dispute (both the appeal and details queries ask for root field `dispute`) and its template. */
const serveDispute = (secondsIntoAppeal: number, round: LocalRound) => {
  const details = aDisputeDetails({
    period: Period.Appeal,
    lastPeriodChange: String(T0 - secondsIntoAppeal),
    currentRound: aDisputeDetailsRound({
      disputeKit: { __typename: "DisputeKit", id: "1", address: classicKit.address },
    }),
  });
  const dispute = {
    ...details,
    currentRound: { ...details.currentRound, timesPerPeriod: DEFAULT_TIMES_PER_PERIOD },
    disputeKitDispute: [aClassicDisputeKitDispute({ localRounds: [aClassicLocalRound(round)] })],
  };
  server.use(
    subgraphHandler({ dispute: () => dispute }).handler,
    subgraphHandler(
      {
        disputeTemplate: () => ({
          id: "1",
          templateTag: "test",
          templateData: JSON.stringify(aPopulatedDispute()),
          templateDataMappings: null,
        }),
      },
      TEST_URLS.drtSubgraph
    ).handler
  );
};

const renderOptions = () => {
  const setAmount = vi.fn();
  const rendered = renderWithProviders(<Options setAmount={setAmount} />, {
    route: "/cases/12/appeal",
    path: "/cases/:id/*",
    reads,
    providers: [ClassicAppealProvider],
  });
  return { ...rendered, setAmount };
};

const QUESTION = "Which option do you want to fund?";
// Stage one renders each card as the label of a radio; stage two as a plain list item.
const cards = (): HTMLElement[] => {
  const group = screen.queryByRole("radiogroup", { name: QUESTION });
  if (!group) return within(screen.getByRole("list", { name: QUESTION })).getAllByRole("listitem");
  return within(group)
    .getAllByRole("radio")
    .map((radio) => (radio as HTMLInputElement).labels![0]);
};
const cardTitle = (el: HTMLElement) => el.querySelector("label")?.textContent;
const card = (title: string) => cards().find((el) => cardTitle(el) === title)!;
const cardTitles = () => cards().map(cardTitle);
const radio = (title: string) =>
  within(screen.getByRole("radiogroup", { name: QUESTION })).getByRole("radio", {
    name: new RegExp(`^${title} Jury decision`),
  });

describe("Classic appeal funding options", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: T0 * 1000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("stage one (loser side still open)", () => {
    it("asks each option for its own required funding: winner pays less than losers", async () => {
      serveDispute(60, {
        winningChoice: "1",
        answers: [aClassicAnswer({ answerId: "2", paidFee: "50000000000000000" })],
      });
      renderOptions();

      expect(await screen.findByText("Which option do you want to fund?")).toBeInTheDocument();
      await screen.findByText("Yes");

      expect(cardTitles()).toEqual(["Refuse to Arbitrate / Invalid", "Yes", "No"]);
      expect(within(card("Yes")).getByText("Jury decision - Winner")).toBeInTheDocument();
      expect(
        within(card("Yes")).getByText(`0 out of ${formatEther(WINNER_REQUIRED)} ETH required.`)
      ).toBeInTheDocument();
      expect(within(card("No")).getByText("Jury decision - Loser")).toBeInTheDocument();
      expect(
        within(card("No")).getByText(`0.05 out of ${formatEther(LOSER_REQUIRED)} ETH required.`)
      ).toBeInTheDocument();
    });

    it("prefills the remaining contribution with the option's required funding when selected", async () => {
      serveDispute(60, { winningChoice: "1" });
      const { user, setAmount } = renderOptions();
      await screen.findByText("No");

      await user.click(screen.getByText("No"));
      expect(setAmount).toHaveBeenLastCalledWith(formatEther(LOSER_REQUIRED));

      await user.click(screen.getByText("Yes"));
      expect(setAmount).toHaveBeenLastCalledWith(formatEther(WINNER_REQUIRED));
    });

    it("marks a fully funded option and disables its selector", async () => {
      serveDispute(60, {
        winningChoice: "1",
        answers: [aClassicAnswer({ answerId: "2", paidFee: LOSER_REQUIRED.toString(), funded: true })],
      });
      renderOptions();
      await screen.findByText("No");

      expect(within(card("No")).getByText("Fully funded!")).toBeInTheDocument();
      expect(radio("No")).toBeDisabled();
      expect(radio("Yes")).toBeEnabled();
    });
    it("does not select or prefill a fully funded option when clicked", async () => {
      serveDispute(60, {
        winningChoice: "1",
        answers: [aClassicAnswer({ answerId: "2", paidFee: LOSER_REQUIRED.toString(), funded: true })],
      });
      const { user, setAmount } = renderOptions();
      await screen.findByText("No", { selector: "label" });
      setAmount.mockClear();

      await user.click(card("No"));

      expect(radio("No")).not.toBeChecked();
      expect(setAmount).not.toHaveBeenCalled();
    });
  });

  describe("stage two (only the winner can still be funded)", () => {
    const pastLoserDeadline = APPEAL_PERIOD / 2 + 60;

    it("offers only the winning option once a losing option was funded", async () => {
      serveDispute(pastLoserDeadline, {
        winningChoice: "1",
        fundedChoices: ["2"],
        answers: [aClassicAnswer({ answerId: "2", paidFee: LOSER_REQUIRED.toString(), funded: true })],
      });
      const { setAmount } = renderOptions();

      await screen.findByText("Yes");
      expect(cardTitles()).toEqual(["Yes"]);
      await waitFor(() => expect(setAmount).toHaveBeenCalledWith(formatEther(WINNER_REQUIRED)));
    });

    it("says no appeal is possible when no losing option was funded in time", async () => {
      serveDispute(pastLoserDeadline, { winningChoice: "1", fundedChoices: [] });
      renderOptions();

      expect(await screen.findByText(/No losing option has been funded/i)).toBeInTheDocument();
    });
  });
});
