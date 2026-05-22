import { createContext, MutableRefObject } from "react";

import { OverlayScrollbarsComponentRef } from "overlayscrollbars-react";

export const OverlayScrollContext = createContext<MutableRefObject<OverlayScrollbarsComponentRef | null> | null>(null);
