import type { ChainClient, Clock } from "../../ports";
import { chainlinkAggregatorAbi } from "../abi/chainlinkAggregator";
import { feedAddress, type ChainlinkProviderConfig } from "../config";
import { errorDetail, toE18, type PriceProvider, type ProviderObservation } from "./types";

type RoundData = readonly [bigint, bigint, bigint, bigint, bigint];

/**
 * Chainlink USD aggregators read through the chain's `ChainClient` (`latestRoundData`, `decimals`). Each feed is
 * stale past its own `freshnessSeconds` (feeds have different heartbeats), else the provider's `freshnessSeconds`.
 */
export class ChainlinkProvider implements PriceProvider {
  readonly id = "chainlink";
  readonly family = "chainlink";
  private readonly decimals = new Map<string, number>();

  constructor(
    readonly source: string,
    private readonly config: Pick<ChainlinkProviderConfig, "feeds">,
    private readonly freshnessSeconds: number,
    private readonly chain: ChainClient,
    private readonly clock: Clock
  ) {}

  async observe(base: string): Promise<ProviderObservation> {
    const tag = { source: this.source, family: this.family, base };
    const configured = this.config.feeds[base];
    if (!configured) return { kind: "error", ...tag, detail: `no Chainlink feed configured for ${base}` };
    const feed = feedAddress(configured);
    const freshnessSeconds =
      typeof configured === "string" ? this.freshnessSeconds : (configured.freshnessSeconds ?? this.freshnessSeconds);
    try {
      const decimals = await this.feedDecimals(feed);
      const round = await this.chain.readContract<RoundData>({
        address: feed,
        abi: chainlinkAggregatorAbi,
        functionName: "latestRoundData",
      });
      const answer = round[1];
      const updatedAt = round[3];
      if (answer <= 0n) return { kind: "error", ...tag, detail: `non-positive answer ${answer}` };
      const priceE18 = toE18(answer, decimals);
      const observedAt = new Date(Number(updatedAt) * 1000);
      const ageSeconds = (this.clock.now().getTime() - observedAt.getTime()) / 1000;
      if (updatedAt === 0n || ageSeconds > freshnessSeconds) {
        return {
          kind: "stale",
          ...tag,
          priceE18,
          observedAt,
          detail: `updated ${Math.round(ageSeconds)}s ago, freshness limit ${freshnessSeconds}s`,
        };
      }
      return { kind: "price", ...tag, priceE18, observedAt };
    } catch (error) {
      return { kind: "error", ...tag, detail: errorDetail(error) };
    }
  }

  private async feedDecimals(feed: `0x${string}`): Promise<number> {
    const key = feed.toLowerCase();
    const cached = this.decimals.get(key);
    if (cached !== undefined) return cached;
    const decimals = Number(
      await this.chain.readContract<number | bigint>({
        address: feed,
        abi: chainlinkAggregatorAbi,
        functionName: "decimals",
      })
    );
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error(`invalid decimals ${decimals}`);
    this.decimals.set(key, decimals);
    return decimals;
  }
}
