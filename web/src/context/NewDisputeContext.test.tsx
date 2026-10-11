import { act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreAddress } from "hooks/contracts/generated";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { MIN_DISPUTE_BATCH_SIZE, NewDisputeProvider, useNewDisputeContext } from "./NewDisputeContext";

const renderContext = (route = "/resolver/title") =>
  renderHookWithProviders(() => useNewDisputeContext(), { route, providers: [NewDisputeProvider] });

const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "null");

describe("NewDisputeContext", () => {
  it("throws outside its provider", () => {
    // React rethrows render errors through jsdom's error event; keep them out of the test log.
    const silence = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", silence);
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHookWithProviders(() => useNewDisputeContext())).toThrow("Context Provider not found.");
    window.removeEventListener("error", silence);
  });

  it("starts a classic, 3-juror, two-option draft", () => {
    const { result } = renderContext();

    expect(result.current.disputeData).toMatchObject({
      numberOfJurors: 3,
      disputeKitId: DisputeKits.Classic,
      title: "",
      version: "1.0",
    });
    expect(result.current.disputeData.answers).toHaveLength(2);
    expect(result.current.batchSize).toBe(MIN_DISPUTE_BATCH_SIZE);
  });

  it("persists the draft to localStorage and restores it on the next visit", () => {
    const { result, unmount } = renderContext();
    act(() => result.current.setDisputeData({ ...result.current.disputeData, title: "Late delivery" }));
    expect(stored("disputeData").title).toBe("Late delivery");
    unmount();

    const { result: next } = renderContext("/resolver/description");
    expect(next.current.disputeData.title).toBe("Late delivery");
  });

  it.each(["/resolver/policy", "/attachment/?url=x"])("keeps the draft on %s", (route) => {
    localStorage.setItem("disputeData", JSON.stringify({ title: "Keep me", answers: [] }));
    const { result } = renderContext(route);
    expect(result.current.disputeData.title).toBe("Keep me");
  });

  it("clears the draft and batch size when the user leaves the resolver", () => {
    localStorage.setItem("disputeData", JSON.stringify({ title: "Stale", answers: [] }));
    localStorage.setItem("disputeBatchSize", "7");

    const { result } = renderContext("/cases/display/1/desc/all");

    expect(result.current.disputeData.title).toBe("");
    expect(result.current.batchSize).toBe(MIN_DISPUTE_BATCH_SIZE);
    expect(stored("disputeData").title).toBe("");
    expect(stored("disputeBatchSize")).toBe(MIN_DISPUTE_BATCH_SIZE);
  });

  it("resetDisputeData restores a fresh draft", () => {
    const { result } = renderContext();
    act(() => {
      result.current.setDisputeData({ ...result.current.disputeData, title: "x", numberOfJurors: 9 });
      result.current.setBatchSize(5);
    });
    act(() => result.current.resetDisputeData());

    expect(result.current.disputeData).toMatchObject({ title: "", numberOfJurors: 3 });
    expect(result.current.batchSize).toBe(MIN_DISPUTE_BATCH_SIZE);
  });

  describe("disputeTemplate", () => {
    const draft = {
      title: "Late delivery",
      description: "Parcel arrived late",
      question: "Refund?",
      category: "Commerce",
      policyURI: "",
      courtId: "2",
      numberOfJurors: 5,
      arbitrationCost: "1000",
      disputeKitId: DisputeKits.Gated,
      version: "1.0",
      answers: [
        { id: "1", title: "Yes", description: "Refund" },
        { id: "10", title: "Partial", description: "Half" },
      ],
      aliasesArray: [
        { id: "1", name: "Buyer", address: "0x00000000000000000000000000000000000000b1", isValid: true },
        { id: "2", name: "Seller", address: "seller.eth", isValid: false },
        { id: "3", name: "", address: "", isValid: true },
      ],
    };

    const template = () => {
      const { result } = renderContext();
      act(() => result.current.setDisputeData(draft));
      return result.current.disputeTemplate as typeof result.current.disputeTemplate & Record<string, unknown>;
    };

    it("drops resolver-only fields and stamps the arbitrator of the default chain", () => {
      const t = template();
      for (const field of ["courtId", "numberOfJurors", "arbitrationCost", "disputeKitId"]) {
        expect(t).not.toHaveProperty(field);
      }
      expect(t.arbitratorAddress).toBe(klerosCoreAddress[DEFAULT_CHAIN.id]);
      expect(t.arbitratorChainID).toBe(String(DEFAULT_CHAIN.id));
    });

    it("writes answer ids as hex, as the SDK schema requires", () => {
      expect(template().answers.map((a) => a.id)).toEqual(["0x1", "0xa"]);
    });

    it("keeps only valid, non-empty aliases as a name -> address map", () => {
      expect(template().aliases).toEqual({ Buyer: "0x00000000000000000000000000000000000000b1" });
    });

    it("omits an empty policy URI", () => {
      expect(template()).not.toHaveProperty("policyURI");
    });

    it("omits aliases entirely when none is valid", () => {
      const { result } = renderContext();
      act(() => result.current.setDisputeData({ ...draft, aliasesArray: [{ name: "", address: "" }] }));
      expect(result.current.disputeTemplate).not.toHaveProperty("aliases");
      expect(result.current.disputeTemplate).not.toHaveProperty("aliasesArray");
    });
  });
});
