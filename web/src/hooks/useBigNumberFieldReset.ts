import { useEffect, useRef, useState } from "react";

/**
 * `BigNumberField` renders "NaN" for `value=""` and ignores `value={undefined}`, so a consumer that
 * clears its amount from outside the field (e.g. after a transaction popup closes) has no way to
 * empty the input through props. Remount it instead: returns a `key` that changes when `amount`
 * becomes empty while the input still shows something and is not being edited.
 */
export const useBigNumberFieldReset = (amount: string) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [key, setKey] = useState(0);
  useEffect(() => {
    const input = inputRef.current;
    if (amount === "" && input?.value && document.activeElement !== input) setKey((k) => k + 1);
  }, [amount]);
  return { key, inputRef };
};
