"use server";

import axios from "axios";
export async function getCurrentExchangeRate(localCurrencyCode: string) {
  const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
  const BASE_URL = "https://v6.exchangerate-api.com/v6";
  const FROM_CURRENCY = "USD";
  const TO_CURRENCY = localCurrencyCode;
  try {
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/pair/${FROM_CURRENCY}/${TO_CURRENCY}`
    );
    const exchangeRate = response.data.conversion_rate;
    return exchangeRate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}
