import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import { type Address, type PublicClient } from "viem";
import { usePublicClient } from "wagmi";

import { Copiable, TextField } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { useRulerContext } from "context/RulerContext";
import { klerosCoreAddress } from "hooks/contracts/generated";
import { cn } from "utils/cn";
import { shortenAddress } from "utils/shortenAddress";
import { validateAddress } from "utils/validateAddressOrEns";

const SelectArbitrable: React.FC = () => {
  const { arbitrable, setArbitrable, knownArbitrables } = useRulerContext();
  const publicClient = usePublicClient({ chainId: 1 }) as PublicClient;
  const [isClient, setIsClient] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestionsId = useId();

  // hydration workaround, local storage is inevitably going to be different, so knownArbitrables will be different
  // server and client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const items = useMemo(
    () =>
      !isClient ? [] : knownArbitrables.map((arbitrable) => ({ text: shortenAddress(arbitrable), id: arbitrable })),
    [isClient, knownArbitrables]
  );

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      document.getElementById(`${suggestionsId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen, suggestionsId]);

  const handleInputChange = useCallback(
    async (value: string) => {
      setInputValue(value);
      setError(null);

      if (value) {
        const isValid = await validateAddress(value, publicClient);
        if (isValid) {
          setArbitrable(value as Address);
        } else {
          setError("Invalid address or ENS name");
        }
      } else {
        setArbitrable("" as Address);
      }
    },
    [publicClient, setArbitrable]
  );

  const [[chainId, address]] = Object.entries(klerosCoreAddress);
  if (chainId !== DEFAULT_CHAIN.toString()) {
    console.error(`Kleros Core is not deployed on chain ${chainId}`);
  }

  return (
    <div
      className={cn(
        "my-4 flex w-full flex-wrap items-center justify-around gap-4 rounded-[3px]",
        "bg-klerosUIComponentsWhiteBackground px-4 py-2"
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <label>Ruler Address:</label>
        <Copiable copiableContent={address} info="Ruler Address">
          <label>{shortenAddress(address)}</label>
        </Copiable>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2" suppressHydrationWarning>
        <label>Arbitrable:</label>
        <div
          className="relative"
          onBlur={() => {
            setIsOpen(false);
            setActiveIndex(-1);
          }}
        >
          <TextField
            aria-label="Arbitrable address or ENS name"
            className="w-auto lg:min-w-[250px]"
            value={inputValue}
            placeholder="Enter Arbitrable"
            onChange={handleInputChange}
            inputProps={{
              className: "[font-family:Arial] text-[13.3333px] [line-height:normal]",
              role: "combobox",
              "aria-autocomplete": "list",
              "aria-expanded": isOpen && items.length > 0,
              "aria-controls": suggestionsId,
              "aria-describedby": error ? `${suggestionsId}-error` : undefined,
              "aria-invalid": !!error,
              "aria-activedescendant": isOpen && activeIndex >= 0 ? `${suggestionsId}-${activeIndex}` : undefined,
              onFocus: () => setIsOpen(true),
              onClick: () => setIsOpen(true),
              onKeyDown: (event) => {
                if (event.nativeEvent.isComposing) return;
                if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length > 0) {
                  event.preventDefault();
                  setIsOpen(true);
                  setActiveIndex((index) =>
                    event.key === "ArrowDown" ? (index + 1) % items.length : (index <= 0 ? items.length : index) - 1
                  );
                } else if (event.key === "Enter" && isOpen && activeIndex >= 0) {
                  event.preventDefault();
                  void handleInputChange(items[activeIndex].id);
                  setIsOpen(false);
                  setActiveIndex(-1);
                } else if (event.key === "Escape") {
                  setIsOpen(false);
                  setActiveIndex(-1);
                }
              },
            }}
          />
          {isOpen && items.length > 0 && (
            <ul
              id={suggestionsId}
              role="listbox"
              aria-label="Recent arbitrables"
              className={cn(
                "absolute top-10 left-0 z-[1] m-0 max-h-[350px] w-full list-none overflow-y-auto",
                "rounded-[3px] border border-klerosUIComponentsStroke",
                "bg-klerosUIComponentsWhiteBackground px-0 py-4 shadow-default"
              )}
            >
              {items.map((item, index) => (
                <li
                  id={`${suggestionsId}-${index}`}
                  key={item.id}
                  role="option"
                  aria-selected={item.id.toLowerCase() === arbitrable?.toLowerCase()}
                  className={cn(
                    "cursor-pointer border-l-[3px] border-l-transparent py-[11.5px] pr-4 pl-[13px]",
                    "text-base leading-[22px] text-klerosUIComponentsPrimaryText",
                    "hover:bg-klerosUIComponentsMediumBlue",
                    activeIndex === index && "bg-klerosUIComponentsMediumBlue",
                    item.id.toLowerCase() === arbitrable?.toLowerCase() &&
                      "border-l-klerosUIComponentsPrimaryBlue bg-klerosUIComponentsMediumBlue"
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    void handleInputChange(item.id);
                    setIsOpen(false);
                    setActiveIndex(-1);
                  }}
                >
                  {item.text}
                </li>
              ))}
            </ul>
          )}
          {error && (
            <div id={`${suggestionsId}-error`} className="mt-1 text-sm text-[#ff0000]">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectArbitrable;
