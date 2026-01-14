export enum ArbitratorTypes {
  vanilla,
  university,
}

export const getArbitratorType = (id: keyof typeof ArbitratorTypes = "vanilla"): ArbitratorTypes => ArbitratorTypes[id];
