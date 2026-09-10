import React, { useState } from "react";

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BigNumberField } from "@kleros/ui-components-library";

import { useBigNumberFieldReset } from "./useBigNumberFieldReset";

let resetFromOutside: () => void = () => {};

const Harness: React.FC = () => {
  const [amount, setAmount] = useState("");
  const { key, inputRef } = useBigNumberFieldReset(amount);
  resetFromOutside = () => setAmount("");
  return (
    <>
      <BigNumberField
        key={key}
        inputRef={inputRef}
        inputProps={{ "aria-label": "amount" }}
        value={amount || undefined}
        onChange={(value) => setAmount(value.isZero() ? "" : value.toString())}
      />
      <output>{amount}</output>
    </>
  );
};

describe("useBigNumberFieldReset", () => {
  it("empties the field when the amount is cleared from outside, but not while the user is typing", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = () => screen.getByRole<HTMLInputElement>("spinbutton", { name: "amount" });

    await user.click(input());
    await user.keyboard("1000");
    expect(input().value).toBe("1000");
    expect(screen.getByRole("status").textContent).toBe("1000");

    // user clears it: no remount, field stays focused and empty
    await user.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}");
    expect(input().value).toBe("");
    expect(document.activeElement).toBe(input());

    await user.keyboard("25");
    await user.tab();
    expect(input().value).toBe("25");

    act(() => resetFromOutside());
    expect(screen.getByRole("status").textContent).toBe("");
    expect(input().value).toBe("");
  });
});
