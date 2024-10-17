export enum ArbitratorTypes {
  vanilla,
  university,
  neo,
}

export const getArbitratorType = (id: keyof typeof ArbitratorTypes = "vanilla"): ArbitratorTypes => ArbitratorTypes[id];
