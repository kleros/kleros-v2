import React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DisputeKits } from "src/dispute-kits";

import Reveal from "./Reveal";

const { revealVote } = vi.hoisted(() => ({ revealVote: vi.fn() }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "1" }),
}));

vi.mock("hooks/useRevealVote", () => ({
  useRevealVote: () => ({ mutateAsync: revealVote, isPending: false }),
}));

vi.mock("queries/useDisputeDetailsQuery", () => ({
  useDisputeDetailsQuery: () => ({ data: { dispute: { currentRoundIndex: 0 } } }),
}));

vi.mock("queries/usePopulatedDisputeData", () => ({
  usePopulatedDisputeData: () => ({ data: { answers: [{ id: "0x1" }] } }),
}));

vi.mock("src/dispute-kits", () => ({
  DisputeKits: { Shutter: 2 },
}));

vi.mock("@kleros/ui-components-library", async () => {
  const ReactModule = await import("react");
  return {
    Button: ({ text, onPress, isDisabled }: { text: string; onPress: () => void; isDisabled?: boolean }) =>
      ReactModule.createElement("button", { type: "button", onClick: onPress, disabled: isDisabled }, text),
  };
});

describe("Shutter Reveal", () => {
  it("does not send an empty justification, so the stored commit-time one is used", async () => {
    const user = userEvent.setup();

    render(
      <Reveal
        voteIDs={["0", "1"]}
        setIsOpen={vi.fn()}
        disputeKitId={DisputeKits.Shutter}
        commit="0xabc"
        arbitrable="0x1234567890123456789012345678901234567890"
      />
    );

    await user.click(screen.getByRole("button"));

    expect(revealVote).toHaveBeenCalledTimes(1);
    const { params } = revealVote.mock.calls[0][0] as { params: { justification?: string } };
    expect(params.justification).toBeUndefined();
  });
});
