import React from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverlayScrollContext } from "context/OverlayScrollContext";

import { useLockOverlayScroll } from "./useLockOverlayScroll";

const setup = () => {
  const options = vi.fn();
  const osInstance = { options };
  const ref = { current: { osInstance: () => osInstance } } as unknown as React.ContextType<
    typeof OverlayScrollContext
  >;
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <OverlayScrollContext.Provider value={ref}>{children}</OverlayScrollContext.Provider>
  );
  const isLocked = () => options.mock.lastCall?.[0].overflow.y === "hidden";
  return { wrapper, isLocked };
};

describe("useLockOverlayScroll", () => {
  it("keeps the page locked until the last open popup closes", () => {
    const { wrapper, isLocked } = setup();
    const settings = renderHook(({ isOpen }) => useLockOverlayScroll(isOpen), {
      wrapper,
      initialProps: { isOpen: true },
    });
    const votePopup = renderHook(({ isOpen }) => useLockOverlayScroll(isOpen), {
      wrapper,
      initialProps: { isOpen: true },
    });

    settings.rerender({ isOpen: false });
    expect(isLocked()).toBe(true);

    votePopup.unmount();
    expect(isLocked()).toBe(false);
  });

  it("stays locked when a popup opens as another one closes", () => {
    const { wrapper, isLocked } = setup();
    const { rerender } = renderHook(
      ({ isMenuOpen, isDialogOpen }) => {
        useLockOverlayScroll(isMenuOpen);
        useLockOverlayScroll(isDialogOpen);
      },
      { wrapper, initialProps: { isMenuOpen: true, isDialogOpen: false } }
    );

    rerender({ isMenuOpen: false, isDialogOpen: true });
    expect(isLocked()).toBe(true);

    rerender({ isMenuOpen: false, isDialogOpen: false });
    expect(isLocked()).toBe(false);
  });
});
