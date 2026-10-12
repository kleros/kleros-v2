import React from "react";

import { screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { aDisputeDetails, aPopulatedDispute, aTemplateAnswer, DEFAULT_ARBITRABLE } from "src/test/builders";
import { TEST_URLS } from "src/test/env";
import { server } from "src/test/msw/server";
import { subgraphHandler } from "src/test/msw/subgraph";
import { renderWithProviders } from "src/test/renderWithProviders";

import Options from "./OptionsContainer";

const serveTemplate = (
  answers = [aTemplateAnswer({ id: "0x1", title: "Yes" }), aTemplateAnswer({ id: "0x2", title: "No" })]
) =>
  server.use(
    subgraphHandler({ dispute: () => aDisputeDetails() }).handler,
    subgraphHandler(
      {
        disputeTemplate: () => ({
          id: "1",
          templateTag: "test",
          templateData: JSON.stringify(aPopulatedDispute({ question: "Should the buyer be refunded?", answers })),
          templateDataMappings: null,
        }),
      },
      TEST_URLS.drtSubgraph
    ).handler
  );

const renderOptions = (handleSelection = vi.fn().mockResolvedValue(undefined)) => {
  const rendered = renderWithProviders(<Options arbitrable={DEFAULT_ARBITRABLE} handleSelection={handleSelection} />, {
    route: "/cases/12/voting",
    path: "/cases/:id/*",
  });
  return { ...rendered, handleSelection };
};

const dialog = () => screen.getByRole("dialog", { name: "Confirm your vote" });

// Each option's Tooltip trigger is a div[role="button"] with the same name; the option is the <button> inside it.
const options = (name: string) => screen.queryAllByRole("button", { name }).filter((el) => el.tagName === "BUTTON");
const option = (name: string) => {
  const matches = options(name);
  expect(matches).toHaveLength(1);
  return matches[0];
};
const findOption = async (name: string) => {
  await screen.findAllByRole("button", { name });
  return option(name);
};

describe("Voting options", () => {
  it("lists the template answers, with Refuse to Arbitrate set apart", async () => {
    serveTemplate();
    renderOptions();

    expect(await findOption("Yes")).toBeInTheDocument();
    expect(option("No")).toBeInTheDocument();
    expect(option("Refuse to Arbitrate / Invalid")).toBeInTheDocument();
    expect(screen.getByText("Should the buyer be refunded?")).toBeInTheDocument();
  });

  it("asks for confirmation and casts the chosen answer id", async () => {
    serveTemplate();
    const { user, handleSelection } = renderOptions();

    await user.click(await findOption("No"));
    expect(within(dialog()).getByText("No")).toBeInTheDocument();
    expect(handleSelection).not.toHaveBeenCalled();

    await user.click(within(dialog()).getByRole("button", { name: "Confirm vote" }));

    expect(handleSelection).toHaveBeenCalledWith(2n);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("casts choice 0 for Refuse to Arbitrate", async () => {
    serveTemplate();
    const { user, handleSelection } = renderOptions();

    await user.click(await findOption("Refuse to Arbitrate / Invalid"));
    await user.click(within(dialog()).getByRole("button", { name: "Confirm vote" }));

    expect(handleSelection).toHaveBeenCalledWith(0n);
  });

  it("casts nothing when the juror cancels", async () => {
    serveTemplate();
    const { user, handleSelection } = renderOptions();

    await user.click(await findOption("Yes"));
    await user.click(within(dialog()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(handleSelection).not.toHaveBeenCalled();
  });

  it("locks every option while the vote is being sent and unlocks after a failure", async () => {
    serveTemplate();
    let reject!: (error: Error) => void;
    const handleSelection = vi.fn(() => new Promise<void>((_, rej) => (reject = rej)));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { user } = renderOptions(handleSelection);

    await user.click(await findOption("Yes"));
    await user.click(within(dialog()).getByRole("button", { name: "Confirm vote" }));

    expect(option("No")).toBeDisabled();
    expect(option("Refuse to Arbitrate / Invalid")).toBeDisabled();

    reject(new Error("User rejected the request."));
    await waitFor(() => expect(option("No")).toBeEnabled());
  });

  it("replaces a template 0x0 answer with the standard Refuse to Arbitrate option", async () => {
    serveTemplate([
      aTemplateAnswer({ id: "0x0", title: "ignored", description: "The contract is void" }),
      aTemplateAnswer({ id: "0x1", title: "Yes" }),
    ]);
    const { user, handleSelection } = renderOptions();

    await user.click(await findOption("Refuse to Arbitrate / Invalid"));
    await user.click(within(dialog()).getByRole("button", { name: "Confirm vote" }));

    expect(handleSelection).toHaveBeenCalledWith(0n);
    expect(options("ignored")).toHaveLength(0);
  });
});
