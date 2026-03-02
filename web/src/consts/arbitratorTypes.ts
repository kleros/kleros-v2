export enum ArbitratorTypes {
  vanilla,
}
/**
 * @note For now not removing this in case we ever need it again,
 * previously this was used to distinguish between `vanilla` and `university` arbitrator */
export const getArbitratorType = (id: keyof typeof ArbitratorTypes = "vanilla"): ArbitratorTypes => ArbitratorTypes[id];
