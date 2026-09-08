import React, { useState } from "react";
import { ThemeProvider } from "styled-components";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CustomRadio } from "@kleros/ui-components-library";

import { Features } from "src/dispute-kits/types";

import { lightTheme } from "styles/themes";

import { FeatureRadio } from "./FeatureRadio";

// Mirrors FeatureSelection: a controlled group whose selection can also be cleared by
// pressing the selected option again.
//
// Limitation: jsdom dispatches an event synchronously, with no microtask checkpoint between the
// capture and bubble listeners. Browsers do flush React there, which is why FeatureRadio defers
// the deselect (see its comment). This test guards the wiring, not that browser timing; a
// synchronous deselect would also pass here while failing in Chromium.
const Harness: React.FC = () => {
  const [selected, setSelected] = useState<Features | null>(null);
  const features = [Features.ClassicVote, Features.ShieldedVote];
  return (
    <ThemeProvider theme={lightTheme}>
      <CustomRadio aria-label="voting" value={selected} onChange={(value) => setSelected(value as Features)}>
        {features.map((feature) => (
          <FeatureRadio
            key={feature}
            value={feature}
            label={feature}
            checked={selected === feature}
            disabled={false}
            onDeselect={() => setSelected(null)}
          />
        ))}
      </CustomRadio>
    </ThemeProvider>
  );
};

describe("FeatureRadio", () => {
  it("selects on press and deselects when the selected option is pressed again", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const classic = screen.getByRole<HTMLInputElement>("radio", { name: Features.ClassicVote });
    const shielded = screen.getByRole<HTMLInputElement>("radio", { name: Features.ShieldedVote });

    await user.click(screen.getByText(Features.ClassicVote));
    expect(classic.checked).toBe(true);

    // Deselect is applied after react-aria's own press handling has run.
    await user.click(screen.getByText(Features.ClassicVote));
    await waitFor(() => expect(classic.checked).toBe(false));
    expect(shielded.checked).toBe(false);

    await user.click(screen.getByText(Features.ShieldedVote));
    expect(shielded.checked).toBe(true);
    await user.click(screen.getByText(Features.ClassicVote));
    expect(classic.checked).toBe(true);
    expect(shielded.checked).toBe(false);
  });

  it("deselects the focused selected option with Space", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const classic = screen.getByRole<HTMLInputElement>("radio", { name: Features.ClassicVote });

    await user.click(screen.getByText(Features.ClassicVote));
    expect(classic.checked).toBe(true);
    expect(document.activeElement).toBe(classic);

    await user.keyboard(" ");
    await waitFor(() => expect(classic.checked).toBe(false));
  });
});
