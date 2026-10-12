import React from "react";

import { screen, waitFor } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, it, expect } from "vitest";

import IsListProvider from "context/IsListProvider";
import { encodeURIFilter } from "utils/uri";

import type { Dispute_Filter } from "src/graphql/graphql";
import { Period } from "src/graphql/graphql";
import { aCounter, aCourtDetails } from "src/test/builders";
import { server } from "src/test/msw/server";
import { subgraphHandler } from "src/test/msw/subgraph";
import { renderWithProviders } from "src/test/renderWithProviders";

import CasesFetcher, { calculateStats } from "./CasesFetcher";

const counter = aCounter();
const court = aCourtDetails();

describe("calculateStats", () => {
  it.each<[string, Dispute_Filter, { totalCases: number; ruledCases: number }]>([
    ["all", {}, { totalCases: 40, ruledCases: 25 }],
    ["in progress", { ruled: false }, { totalCases: 15, ruledCases: 0 }],
    ["closed", { ruled: true }, { totalCases: 25, ruledCases: 25 }],
    ["appeal", { period: Period.Appeal }, { totalCases: 3, ruledCases: 0 }],
  ])("counts %s cases from the global counter", (_, filter, expected) => {
    expect(calculateStats(false, undefined, counter, filter)).toEqual(expected);
  });

  it.each<[string, Dispute_Filter, { totalCases: number; ruledCases: number }]>([
    ["all", { court: "2" }, { totalCases: 12, ruledCases: 5 }],
    ["in progress", { court: "2", ruled: false }, { totalCases: 7, ruledCases: 0 }],
    ["closed", { court: "2", ruled: true }, { totalCases: 5, ruledCases: 5 }],
    ["appeal", { court: "2", period: Period.Appeal }, { totalCases: 1, ruledCases: 0 }],
  ])("counts %s cases from the court when filtering by court", (_, filter, expected) => {
    expect(calculateStats(true, court, counter, filter)).toEqual(expected);
  });

  it("reports zero while counters load", () => {
    expect(calculateStats(false, undefined, undefined, {})).toEqual({ totalCases: 0, ruledCases: 0 });
  });
});

const CurrentUrl: React.FC = () => {
  const { pathname, search } = useLocation();
  return <output aria-label="current url">{decodeURIComponent(pathname + search)}</output>;
};

const renderCases = (route: string) => {
  const subgraph = subgraphHandler({
    counter: () => counter,
    court: () => ({ id: "1", name: "General", children: [], ...court }),
    disputes: () => [],
  });
  server.use(subgraph.handler);
  const rendered = renderWithProviders(
    <>
      <CasesFetcher />
      <CurrentUrl />
    </>,
    { route, path: "/cases/display/:page/:order/:filter", providers: [IsListProvider] }
  );
  return { ...rendered, subgraphCalls: subgraph.calls };
};

const url = () => screen.getByRole("status", { name: "current url" }).textContent;
const disputesQuery = (calls: { field: string; args: Record<string, unknown> }[]) =>
  calls.filter((c) => c.field === "disputes").at(-1)?.args;

describe("CasesFetcher", () => {
  it("asks the subgraph for the requested page, order and filter (9 per page on desktop)", async () => {
    const filter: Dispute_Filter = { ruled: false, court: "2" };
    const { subgraphCalls } = renderCases(`/cases/display/3/asc/${encodeURIFilter(filter)}`);

    expect(await screen.findByText("No cases found")).toBeInTheDocument();
    expect(disputesQuery(subgraphCalls)).toEqual({
      first: 9,
      skip: 18,
      orderBy: "disputeID",
      orderDirection: "asc",
      where: filter,
    });
  });

  it("queries every dispute, newest first, for the 'all' filter", async () => {
    const { subgraphCalls } = renderCases("/cases/display/1/desc/all");

    await screen.findByText("No cases found");
    expect(disputesQuery(subgraphCalls)).toEqual({ first: 9, skip: 0, orderBy: "disputeID", orderDirection: "desc" });
  });

  it("resets to page 1 and keeps the court filter when the status filter changes", async () => {
    const { user } = renderCases(`/cases/display/4/desc/${encodeURIFilter({ court: "2", ruled: true })}?q=1`);
    await screen.findByText("No cases found");

    await user.click(screen.getByRole("button", { name: /Closed/ }));
    await user.click(screen.getByRole("option", { name: "Appeal" }));

    expect(url()).toBe(`/cases/display/1/desc/${JSON.stringify({ court: "2", period: "appeal" })}?q=1`);
  });

  it("resets to page 1 when the order changes", async () => {
    const { user } = renderCases("/cases/display/4/desc/all");
    await screen.findByText("No cases found");

    await user.click(screen.getByRole("button", { name: /Newest/ }));
    await user.click(screen.getByRole("option", { name: "Oldest" }));

    // An unfiltered list is re-encoded as "{}" rather than "all"; both decode to no filter.
    expect(url()).toMatch(/^\/cases\/display\/1\/asc\/(all|\{\})\??$/);
  });

  it.fails("KNOWN BUG: searching by id from a later page keeps the page, so the match is skipped", async () => {
    const { user } = renderCases("/cases/display/4/desc/all");
    await screen.findByText("No cases found");

    await user.type(screen.getByPlaceholderText("Search by ID"), "12");

    await waitFor(() => expect(url()).toContain('{"id":"12"}'));
    expect(url()).toMatch(/^\/cases\/display\/1\//);
  });
});
