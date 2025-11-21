import { ExchangeRates } from '../types';

const API_URL = "https://api.exchangerate-api.com/v4/latest/USD";

// Fallback rates in case API fails
const FALLBACK_RATES: ExchangeRates = {
  "USD": 1,
  "TWD": 32.5,
  "CNY": 7.2,
  "EUR": 0.92,
  "JPY": 150
};

export const fetchRates = async (): Promise<{ rates: ExchangeRates; isOnline: boolean }> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return { rates: data.rates, isOnline: true };
  } catch (error) {
    console.warn("Exchange rate API failed, using fallback.", error);
    return { rates: FALLBACK_RATES, isOnline: false };
  }
};