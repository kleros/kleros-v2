import type { Clock, Logger } from "../../ports";
import type { CoingeckoProviderConfig } from "../config";
import { errorDetail, type PriceProvider, type ProviderObservation } from "./types";

const DECIMAL = /^(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

/** A non-negative decimal (JSON number text, exponent allowed) scaled to 1e18, floored. */
export function decimalToE18(text: string): bigint {
  const match = DECIMAL.exec(text);
  if (!match) throw new Error(`not a non-negative decimal: ${text}`);
  const digits = `${match[1]}${match[2] ?? ""}`;
  const shift = 18 - (match[2]?.length ?? 0) + Number(match[3] ?? 0);
  return shift >= 0 ? BigInt(digits) * 10n ** BigInt(shift) : BigInt(digits) / 10n ** BigInt(-shift);
}

/**
 * CoinGecko `/api/v3/simple/price` through `ports.fetch`. The API key (optional) is read from the environment
 * variable named in the configuration and only ever placed in the request header: never logged or reported.
 */
export class CoingeckoProvider implements PriceProvider {
  readonly id = "coingecko";
  readonly family = "coingecko";

  constructor(
    readonly source: string,
    private readonly config: Pick<CoingeckoProviderConfig, "baseUrl" | "coinIds" | "apiKeyEnv" | "apiKeyHeader">,
    private readonly freshnessSeconds: number,
    private readonly deps: { fetch: typeof globalThis.fetch; clock: Clock; logger: Logger; env: NodeJS.ProcessEnv }
  ) {}

  async observe(base: string): Promise<ProviderObservation> {
    const coinId = this.config.coinIds[base];
    if (!coinId) return { kind: "error", ...this.tag(base), detail: `no CoinGecko coin id for ${base}` };
    const url = new URL("/api/v3/simple/price", this.config.baseUrl);
    url.searchParams.set("ids", coinId);
    url.searchParams.set("vs_currencies", "usd");
    url.searchParams.set("include_last_updated_at", "true");
    url.searchParams.set("precision", "full");
    const headers: Record<string, string> = { accept: "application/json" };
    const key = this.config.apiKeyEnv ? this.deps.env[this.config.apiKeyEnv] : undefined;
    if (key) headers[this.config.apiKeyHeader] = key;
    try {
      const response = await this.deps.fetch(url.toString(), { headers });
      if (!response.ok) {
        return { kind: "error", ...this.tag(base), detail: `HTTP ${response.status} from CoinGecko` };
      }
      const text = await response.text();
      return this.parse(base, coinId, text);
    } catch (error) {
      // Redact before truncating, so a key cut at the truncation boundary cannot survive as a partial prefix.
      const detail = errorDetail(redact(error instanceof Error ? error.message : String(error), key));
      this.deps.logger.warn("coingecko request failed", { source: this.source, base, detail });
      return { kind: "error", ...this.tag(base), detail };
    }
  }

  private tag(base: string): { source: string; family: string; base: string } {
    return { source: this.source, family: this.family, base };
  }

  private parse(base: string, coinId: string, text: string): ProviderObservation {
    const malformed = (why: string): ProviderObservation => ({
      kind: "error",
      ...this.tag(base),
      detail: `malformed CoinGecko response: ${why}`,
    });
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return malformed("not JSON");
    }
    const entry = (body as Record<string, unknown> | null)?.[coinId] as Record<string, unknown> | undefined;
    if (!entry || typeof entry !== "object") return malformed(`no entry for ${coinId}`);
    const usd = entry.usd;
    const updatedAt = entry.last_updated_at;
    if (typeof usd !== "number" || !Number.isFinite(usd) || usd <= 0) return malformed("usd is not a positive number");
    if (typeof updatedAt !== "number" || !Number.isInteger(updatedAt)) return malformed("no last_updated_at");
    const priceE18 = decimalToE18(String(usd));
    const observedAt = new Date(updatedAt * 1000);
    const ageSeconds = (this.deps.clock.now().getTime() - observedAt.getTime()) / 1000;
    if (ageSeconds > this.freshnessSeconds) {
      return {
        kind: "stale",
        ...this.tag(base),
        priceE18,
        observedAt,
        detail: `updated ${Math.round(ageSeconds)}s ago, freshness limit ${this.freshnessSeconds}s`,
      };
    }
    return { kind: "price", ...this.tag(base), priceE18, observedAt };
  }
}

function redact(text: string, secret: string | undefined): string {
  return secret ? text.split(secret).join("[redacted]") : text;
}
