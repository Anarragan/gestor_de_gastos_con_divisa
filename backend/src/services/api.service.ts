import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL;

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (!API_URL) {
    throw new Error('API_URL is not defined in environment variables');
  }

  try {
    
    const response = await axios.get(`${API_URL}${fromCurrency}`);

    const rate = response.data.rates[toCurrency];

    if (!rate) {
      throw new Error(`No rate found for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error: any) {
    console.error('Error converting currency:', error.message || error);
    throw new Error('Currency conversion failed');
  }
}