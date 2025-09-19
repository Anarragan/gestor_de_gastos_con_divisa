import "dotenv/config";
import axios from "axios";

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.CURRENCY_API_KEY;

export const currencyApi = axios.create({
  baseURL: "https://api.exchangerate-api.com/v4/latest/",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
  }
});

export const convertCurrency = async (from: string, to: string, amount: number) => {
  try {
    const response = await currencyApi.get(`${from}`);
    const rates = response.data.rates;
    const rate = rates[to];
    if (!rate) {
      throw new Error(`Unable to find rate for currency: ${to}`);
    }
    return amount * rate;
  } catch (error) {
    console.error("Error converting currency:", error);
    throw error;
  }
};
