import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type * as VeashiSdk from "@kleros/veashi-sdk";

/**
 * The `@kleros/veashi-sdk` 0.1.0 getters, loaded without `ethers` (decisions [L6], [G3]).
 *
 * The SDK's root entry (`dist/index.js`, its only `exports` entry for code) re-exports its TypeChain factories, which
 * `require("ethers")` eagerly; `ethers` is not a dependency of the bot. The getters themselves live in the SDK's own
 * `dist/getters.js`, which reads only the SDK's address registry (`dist/registry.js` and `dist/addresses/*.json`), and
 * the `Bridges` enum in `dist/types.js`. Both files are loaded by path, resolved next to the root entry the package
 * resolves to, so every address still comes from the SDK getters and no address table is copied here.
 */

type Getters = Pick<typeof VeashiSdk, "getYaho" | "getYaru" | "getReporter" | "getAdapter">;
type Types = Pick<typeof VeashiSdk, "Bridges">;

export type Bridge = VeashiSdk.Bridges;

const require = createRequire(import.meta.url);

/** The directory of the SDK's compiled entry (`node_modules/@kleros/veashi-sdk/dist`). */
export function sdkDistDirectory(): string {
  return dirname(require.resolve("@kleros/veashi-sdk"));
}

let loaded: { getters: Getters; types: Types } | undefined;

function sdk(): { getters: Getters; types: Types } {
  if (!loaded) {
    const dist = sdkDistDirectory();
    loaded = {
      getters: require(join(dist, "getters.js")) as Getters,
      types: require(join(dist, "types.js")) as Types,
    };
  }
  return loaded;
}

/** `Bridges` of the SDK. */
export function bridges(): Types["Bridges"] {
  return sdk().types.Bridges;
}

export function getYaho(sourceChainId: number, destinationChainId: number): string | undefined {
  return sdk().getters.getYaho(sourceChainId, destinationChainId);
}

export function getYaru(sourceChainId: number, destinationChainId: number): string | undefined {
  return sdk().getters.getYaru(sourceChainId, destinationChainId);
}

/** The reporter of `bridge` on `sourceChainId` for messages to `destinationChainId`. */
export function getReporter(sourceChainId: number, destinationChainId: number, bridge: Bridge): string | undefined {
  return sdk().getters.getReporter(sourceChainId, destinationChainId, bridge);
}

/** The adapter of `bridge` on `destinationChainId` for messages from `sourceChainId`. */
export function getAdapter(sourceChainId: number, destinationChainId: number, bridge: Bridge): string | undefined {
  return sdk().getters.getAdapter(sourceChainId, destinationChainId, bridge);
}
