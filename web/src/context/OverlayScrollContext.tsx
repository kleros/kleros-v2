import { createContext, MutableRefObject } from "react";

export const OverlayScrollContext = createContext<MutableRefObject<HTMLElement | null> | null>(null);
