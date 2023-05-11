import React, { useEffect } from "react";

export function useFocusOutside(ref: React.RefObject<HTMLDivElement>, callback: () => void) {
  useEffect(() => {
    function handleEvent(event: FocusEvent | MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("focusin", handleEvent);
    document.addEventListener("mousedown", handleEvent);
    return () => {
      document.removeEventListener("focusin", handleEvent);
      document.removeEventListener("mousedown", handleEvent);
    };
  }, [ref, callback]);
}
