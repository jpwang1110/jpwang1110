export enum Currency {
  USD = 'USD',
  TWD = 'TWD',
  CNY = 'CNY',
  EUR = 'EUR',
  JPY = 'JPY',
}

export type ExchangeRates = Record<string, number>;

export enum UnitTab {
  LENGTH = 'length',
  WEIGHT = 'weight',
  FORCE = 'force',
}

export enum BoxUnit {
  MM = 'mm',
  CM = 'cm',
  INCH = 'inch',
}

export interface PalletPreset {
  name: string;
  l: number;
  w: number;
  h: number;
}

export interface BoxDims {
  l: number;
  w: number;
  h: number;
}