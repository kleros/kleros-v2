import type { Page, Request } from "@playwright/test";
import { privateKeyToAddress } from "viem/accounts";

import { expect, test } from "./fixtures";
import { ACCOUNT_PKEYS } from "./utils";
import { mockSubgraph } from "./utils/mockSubgraph";

const NOW = Date.UTC(2026, 9, 8, 12) / 1000;
const HOUR = 60 * 60;
const DAY = 24 * HOUR;
// evidence, commit, vote, appeal
const TIMES_PER_PERIOD = [DAY, 2 * DAY, 3 * DAY, DAY].map(String);
const ALICE = privateKeyToAddress(ACCOUNT_PKEYS.alice).toLowerCase();
const ARBITRABLE = "0x0000000000000000000000000000000000000001";
const PERIOD_START_BLOCK = "100";

interface CaseFixture {
  id: string;
  title: string;
  period: "commit" | "vote";
  hiddenVotes: boolean;
  /** Seconds until the nominal end of the current period. */
  endsIn: number;
  commited?: boolean;
  draws?: number;
}

const OVERDUE_VOTE: CaseFixture = {
  id: "12",
  title: "Was the logo delivered as agreed?",
  period: "vote",
  hiddenVotes: false,
  endsIn: -DAY,
};
const URGENT_COMMIT: CaseFixture = {
  id: "15",
  title: "Should the escrow be released to the seller?",
  period: "commit",
  hiddenVotes: true,
  endsIn: 5 * HOUR,
  draws: 3,
};
const REVEAL: CaseFixture = {
  id: "20",
  title: "Is this listing compliant with the registry policy?",
  period: "vote",
  hiddenVotes: true,
  endsIn: 2 * DAY,
  commited: true,
};
const VOTE: CaseFixture = {
  id: "22",
  title: "Did the translation meet the requested quality?",
  period: "vote",
  hiddenVotes: false,
  endsIn: 3 * DAY,
};
const OTHER_VOTE: CaseFixture = { ...VOTE, id: "23", title: "Was the bounty claim valid?", endsIn: 2 * DAY };
const OVERDUE_COMMIT: CaseFixture = { ...URGENT_COMMIT, id: "30", endsIn: -HOUR, draws: 1 };

const lastPeriodChange = ({ period, endsIn }: CaseFixture) =>
  (NOW + endsIn - Number(TIMES_PER_PERIOD[period === "commit" ? 1 : 2])).toString();

const toDraws = (fixture: CaseFixture) =>
  Array.from({ length: fixture.draws ?? 1 }, (_, voteId) => ({
    id: `${fixture.id}-0-${voteId}`,
    round: { id: `${fixture.id}-0` },
    dispute: {
      id: fixture.id,
      period: fixture.period,
      ruled: false,
      lastPeriodChange: lastPeriodChange(fixture),
      lastPeriodChangeBlockNumber: PERIOD_START_BLOCK,
      templateId: fixture.id,
      arbitrableChainId: "421614",
      arbitrated: { id: ARBITRABLE },
      court: { name: "General Court" },
      currentRound: {
        id: `${fixture.id}-0`,
        hiddenVotes: fixture.hiddenVotes,
        timesPerPeriod: TIMES_PER_PERIOD,
        disputeKit: { id: "1" },
      },
    },
    vote: fixture.commited ? { __typename: "ClassicVote", commited: true, voted: false } : null,
  }));

const toDisputeDetails = (fixture: CaseFixture) => ({
  court: { id: "1", feeForJuror: "0" },
  arbitrated: { id: ARBITRABLE },
  period: fixture.period,
  ruled: false,
  lastPeriodChange: lastPeriodChange(fixture),
  currentRuling: "0",
  overridden: false,
  tied: true,
  currentRound: {
    id: `${fixture.id}-0`,
    nbVotes: "3",
    timesPerPeriod: TIMES_PER_PERIOD,
    hiddenVotes: fixture.hiddenVotes,
    disputeKit: { id: "1", address: ARBITRABLE },
  },
  currentRoundIndex: "0",
  isCrossChain: false,
  arbitrableChainId: "421614",
  templateId: fixture.id,
  rulingTimestamp: null,
  rulingTransactionHash: null,
});

const toTemplate = (fixture: CaseFixture) => ({
  id: fixture.id,
  templateTag: "e2e",
  templateData: JSON.stringify({
    title: fixture.title,
    description: "Fixture case",
    question: "Which option should win?",
    answers: [
      { id: "0x1", title: "Yes", description: "Yes" },
      { id: "0x2", title: "No", description: "No" },
    ],
    policyURI: "/ipfs/QmPolicy/policy.json",
    arbitratorChainID: "421614",
    arbitratorAddress: ARBITRABLE,
    version: "1.0",
  }),
  templateDataMappings: null,
});

/** Freezes the clock and serves `cases` as the juror's pending draws. */
const setup = async (page: Page, cases: CaseFixture[]) => {
  await page.clock.setFixedTime(NOW * 1000);
  const findCase = (id: unknown) => cases.find((fixture) => fixture.id === id);
  await mockSubgraph(page, {
    draws: () => cases.flatMap(toDraws),
    dispute: ({ id }) => {
      const fixture = findCase(id);
      return fixture ? toDisputeDetails(fixture) : null;
    },
    disputeTemplate: ({ id }) => {
      const fixture = findCase(id);
      return fixture ? toTemplate(fixture) : null;
    },
  });
};

// Batched requests lose the operation name, so match the root field.
const isDrawsRequest = (request: Request) => request.postData()?.includes("draws(") ?? false;

// The theme's colors, light or dark.
const WARNING_COLOR = /rgb\(255, (153, 0|196, 107)\)/;
const PRIMARY_BLUE = /rgb\((0, 154, 255|108, 197, 255)\)/;

const indicator = (page: Page) => page.getByRole("button", { name: /^\d+ to vote/ });
const banner = (page: Page) => page.getByRole("region", { name: "Needs your vote" });
const rows = (page: Page) => banner(page).getByRole("listitem");
const list = (page: Page) => page.getByRole("dialog", { name: "Needs your vote" });

// Deadlines also show as local dates.
test.use({ timezoneId: "UTC" });

test.describe("Juror actions", () => {
  test("shows nothing to a disconnected visitor", async ({ page }) => {
    await setup(page, [URGENT_COMMIT]);
    await page.goto("/");
    await expect(page.getByText("Court Overview")).toBeVisible();

    await expect(indicator(page)).toHaveCount(0);
    await expect(banner(page)).toHaveCount(0);
  });

  test("shows nothing when the juror has nothing due", async ({ page, wallet }) => {
    await setup(page, []);
    await page.goto("/");
    const drawsLoaded = page.waitForResponse((response) => isDrawsRequest(response.request()));
    await wallet.connect("alice");
    await drawsLoaded;
    // Nothing is meant to appear, so let the app render the response before asserting that.
    await page.waitForTimeout(500);

    await expect(page.getByRole("button", { name: ALICE, exact: false })).toBeVisible();
    await expect(indicator(page)).toHaveCount(0);
    await expect(banner(page)).toHaveCount(0);
  });

  test("lists due, urgent and overdue actions, most urgent first", async ({ page, wallet }) => {
    await setup(page, [VOTE, REVEAL, URGENT_COMMIT, OVERDUE_VOTE]);
    await page.goto("/");
    await wallet.connect("alice");

    await expect(indicator(page)).toHaveAccessibleName("4 to vote, 2 urgent");
    await expect(indicator(page)).toHaveText(/^4\s*to vote$/);
    await expect(indicator(page)).toHaveCSS("background-color", WARNING_COLOR);

    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("heading")).toHaveText("Needs your vote");
    await expect(rows(page)).toHaveCount(3);

    const [overdue, urgent, reveal] = [rows(page).nth(0), rows(page).nth(1), rows(page).nth(2)];
    await expect(overdue).toContainText("#12");
    await expect(overdue).toContainText(OVERDUE_VOTE.title);
    await expect(overdue).toContainText("Deadline passed");
    await expect(overdue).toContainText("You may still vote until the period closes");
    await expect(overdue.getByRole("link")).toHaveText("Vote");
    const overdueLink = overdue.getByRole("link", { name: "Vote in case #12" });
    await expect(overdueLink).toHaveAttribute("href", "#/cases/12/voting");
    // Only the first action gets the filled button.
    await expect(overdueLink).toHaveCSS("background-color", PRIMARY_BLUE);

    await expect(urgent).toContainText("#15");
    await expect(urgent).toContainText("Ends in 5h 0m");
    await expect(urgent).toContainText("Thu, Oct 8, 5:00 PM");
    await expect(urgent).toContainText("Urgent");
    await expect(urgent).toContainText("3 votes");
    const commitLink = urgent.getByRole("link", { name: "Commit vote in case #15" });
    await expect(commitLink).toBeVisible();
    await expect(commitLink).not.toHaveCSS("background-color", PRIMARY_BLUE);

    await expect(reveal).toContainText("Ends in 2d 0h");
    await expect(reveal).not.toContainText("Urgent");
    await expect(reveal.getByRole("link", { name: "Reveal vote in case #20" })).toBeVisible();

    await banner(page).getByRole("button", { name: "Show all (4)" }).click();
    await expect(rows(page)).toHaveCount(4);
    await expect(rows(page).nth(3)).toContainText("#22");
    await expect(banner(page).getByRole("button", { name: "Show less" })).toBeVisible();

    await expect(banner(page).getByRole("link", { name: "Get reminders by email" })).toHaveAttribute(
      "href",
      "#/#notifications"
    );
  });

  test("names the action still possible once the deadline passed", async ({ page, wallet }) => {
    await setup(page, [OVERDUE_COMMIT]);
    await page.goto("/");
    await wallet.connect("alice");

    await expect(rows(page).first()).toContainText("Deadline passed");
    await expect(rows(page).first()).toContainText("You may still commit until the period closes");
    await expect(rows(page).first().getByRole("link", { name: "Commit vote in case #30" })).toBeVisible();
  });

  test("uses the neutral style when every deadline is more than 24h away", async ({ page, wallet }) => {
    await setup(page, [VOTE, OTHER_VOTE]);
    await page.goto("/");
    await wallet.connect("alice");

    await expect(indicator(page)).toHaveAccessibleName("2 to vote");
    await expect(indicator(page)).not.toHaveCSS("background-color", WARNING_COLOR);
    await expect(banner(page).getByRole("heading")).toHaveText("Needs your vote");
    await expect(rows(page).nth(0)).toContainText("#23");
    await expect(banner(page)).not.toContainText("Urgent");
    await expect(banner(page).getByRole("button", { name: /Show all/ })).toHaveCount(0);
  });

  test("dismissing hides the banner but keeps the indicator and its list", async ({ page, wallet }) => {
    await setup(page, [URGENT_COMMIT, VOTE]);
    await page.goto("/");
    await wallet.connect("alice");
    await expect(banner(page)).toBeVisible();

    await banner(page).getByRole("button", { name: "Dismiss" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect(indicator(page)).toBeVisible();

    // The mock connector doesn't survive a reload.
    await page.reload();
    await wallet.connect("alice");
    await expect(indicator(page)).toBeVisible();
    await expect(banner(page)).toHaveCount(0);

    await indicator(page).click();
    await expect(list(page).getByRole("listitem")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(banner(page)).toHaveCount(0);
  });

  test("the indicator opens the list over any page, and its links lead to the voting tab", async ({ page, wallet }) => {
    await setup(page, [URGENT_COMMIT]);
    await page.goto("/#/jurors/1/desc/all");
    // Connect on desktop, where the button is in the header, then switch to a short phone screen.
    await wallet.connect("alice");
    await page.setViewportSize({ width: 390, height: 400 });

    await expect(indicator(page)).toHaveAccessibleName("1 to vote, 1 urgent");
    await expect(indicator(page)).toHaveAttribute("aria-expanded", "false");
    await indicator(page).click();

    await expect(list(page)).toBeFocused();
    await expect(list(page)).toContainText("Ends in 5h 0m");
    await page.keyboard.press("Escape");
    await expect(list(page)).toHaveCount(0);
    await expect(indicator(page)).toBeFocused();

    // A click on the page around it closes it too.
    await indicator(page).click();
    await page.mouse.click(195, 390);
    await expect(list(page)).toHaveCount(0);

    await indicator(page).click();
    await list(page).getByRole("link", { name: "Commit vote in case #15" }).click();
    await expect(page).toHaveURL(/#\/cases\/15\/voting$/);
    await expect(list(page)).toHaveCount(0);

    // The case already on screen: same URL, it still closes.
    await indicator(page).click();
    await list(page).getByRole("link", { name: "Commit vote in case #15" }).click();
    await expect(list(page)).toHaveCount(0);
  });

  test("keeps the focus when the focused action goes away while the list is open", async ({ page, wallet }) => {
    await setup(page, [URGENT_COMMIT]);
    await page.goto("/");
    await wallet.connect("alice");
    await indicator(page).click();
    await list(page).getByRole("link", { name: "Commit vote in case #15" }).focus();

    // Sent from another tab: the row turns into "Submitted, confirming…" and the focused link goes away.
    await page.evaluate(
      ({ key, submission }) => {
        window.localStorage.setItem("jurorActionSubmissions", JSON.stringify({ [key]: submission }));
        window.dispatchEvent(new StorageEvent("storage", { key: "jurorActionSubmissions" }));
      },
      { key: `${ALICE}-15-commit`, submission: { block: "150", at: NOW - 60 } }
    );
    const confirming = page.getByRole("dialog", { name: "Confirming your vote" });
    await expect(confirming).toContainText("Submitted, confirming…");
    await expect(confirming).toBeFocused();

    // Nothing is due anymore, yet the pill stays to take the focus back.
    await page.keyboard.press("Escape");
    await expect(confirming).toHaveCount(0);
    await expect(indicator(page)).toBeFocused();
  });

  test("marks an action already sent as confirming", async ({ page, wallet }) => {
    await page.addInitScript(
      ({ key, submission }) =>
        window.localStorage.setItem("jurorActionSubmissions", JSON.stringify({ [key]: submission })),
      { key: `${ALICE}-20-reveal`, submission: { block: "150", at: NOW - 60 } }
    );
    await setup(page, [REVEAL, VOTE]);
    await page.goto("/");
    await wallet.connect("alice");

    await expect(indicator(page)).toHaveAccessibleName("1 to vote");
    const confirming = rows(page).filter({ hasText: "#20" });
    await expect(confirming).toContainText("Submitted, confirming…");
    await expect(confirming.getByRole("link")).toHaveCount(0);
    // The action left to do comes first, with the filled button.
    await expect(rows(page).first().getByRole("link", { name: "Vote in case #22" })).toHaveCSS(
      "background-color",
      PRIMARY_BLUE
    );
  });

  test("says it is confirming once everything left was sent", async ({ page, wallet }) => {
    await page.addInitScript(
      ({ key, submission }) =>
        window.localStorage.setItem("jurorActionSubmissions", JSON.stringify({ [key]: submission })),
      { key: `${ALICE}-20-reveal`, submission: { block: "150", at: NOW - 60 } }
    );
    await setup(page, [REVEAL]);
    await page.goto("/");
    await wallet.connect("alice");

    await expect(banner(page)).toHaveCount(0);
    const confirming = page.getByRole("region", { name: "Confirming your vote" });
    await expect(confirming).toContainText("Submitted, confirming…");
    await expect(indicator(page)).toHaveCount(0);
  });

  test("offers to retry when the actions fail to load", async ({ page, wallet }) => {
    await setup(page, [URGENT_COMMIT]);
    let isSubgraphDown = true;
    await page.route(
      (url) => url.hostname.endsWith("thegraph.com") || url.pathname.includes("/subgraphs/"),
      async (route) => {
        return isSubgraphDown && isDrawsRequest(route.request()) ? route.fulfill({ status: 500 }) : route.fallback();
      }
    );
    await page.goto("/");
    await wallet.connect("alice");

    const retry = page.getByRole("button", { name: "Retry" });
    const announcement = (text: string) => page.getByRole("status").filter({ hasText: text });
    // React Query retries three times before giving up.
    await expect(retry).toBeVisible({ timeout: 30_000 });
    await expect(announcement("Couldn't load your pending votes.")).toHaveCount(1);
    await expect(indicator(page)).toHaveCount(0);

    isSubgraphDown = false;
    await retry.click();
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("heading")).toBeFocused();
    await expect(announcement("Case #15 needs your vote")).toHaveCount(1);
    await expect(indicator(page)).toBeVisible();
  });
});
