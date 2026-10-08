import React from "react";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FormContactDetails from "./index";

const { deleteUser, atlas } = vi.hoisted(() => {
  const deleteUser = vi.fn().mockResolvedValue(true);
  return {
    deleteUser,
    atlas: {
      user: { email: "juror@example.com", isEmailVerified: true, emailUpdateableAt: "2020-01-01" },
      userExists: true,
      deleteUser,
    },
  };
});

vi.mock("@kleros/kleros-app", () => ({ useAtlasProvider: () => atlas }));
vi.mock("wagmi", () => ({ useAccount: () => ({ address: "0x0000000000000000000000000000000000000001" }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("consts/index", () => ({ EMAIL_REGEX: /^[^@]+@[^@]+\.[^@]+$/ }));
vi.mock("consts/chains", () => ({ DEFAULT_CHAIN: {} }));
vi.mock("utils/wrapWithToast", () => ({ errorToast: vi.fn(), infoToast: vi.fn(), successToast: vi.fn() }));

afterEach(cleanup);

describe("notification unsubscribe confirmation", () => {
  it("does not carry keyboard focus onto the destructive confirmation action", () => {
    render(<FormContactDetails toggleIsSettingsOpen={vi.fn()} />);
    const unsubscribe = screen.getByRole("button", { name: "buttons.unsubscribe" });
    act(() => unsubscribe.focus());
    fireEvent.keyDown(unsubscribe, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(unsubscribe, { key: "Enter", code: "Enter" });

    const confirm = screen.getByRole("button", { name: "buttons.confirm_unsubscribe" });
    expect(document.activeElement).not.toBe(confirm);
    expect(deleteUser).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "buttons.cancel" }));
    expect(screen.queryByRole("button", { name: "buttons.unsubscribe" })).not.toBeNull();
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
