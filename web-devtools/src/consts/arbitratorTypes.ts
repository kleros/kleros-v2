export enum ArbitratorTypes {
  vanilla,
}

export const getArbitratorType = (id: keyof typeof ArbitratorTypes = "vanilla" as const): ArbitratorTypes =>
  ArbitratorTypes[id];
