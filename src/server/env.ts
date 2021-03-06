import dotenv from 'dotenv';
import { SIZE } from './constants';
dotenv.config();

const env = {
  PORT: process.env.PORT || '3000',
  DATABASE_URL: process.env.DATABASE_URL as string,

  SHIRT_COST: parseInt(process.env.SHIRT_COST as string, 10),
  SHIRT_STOCK: {
    [SIZE.S]: parseInt(process.env.SHIRT_STOCK_S as string, 10),
    [SIZE.M]: parseInt(process.env.SHIRT_STOCK_M as string, 10),
    [SIZE.L]: parseInt(process.env.SHIRT_STOCK_L as string, 10),
    [SIZE.XL]: parseInt(process.env.SHIRT_STOCK_XL as string, 10),
  },

  INVOICE_EXPIRE_MINS: parseFloat(process.env.INVOICE_EXPIRE_MINS as string),
  LND_GRPC_URL: process.env.LND_GRPC_URL as string,
  LND_INVOICE_MACAROON: process.env.LND_INVOICE_MACAROON as string,
  LND_INVOICE_MACAROON_PATH: process.env.LND_INVOICE_MACAROON_PATH as string,
  LND_READONLY_MACAROON: process.env.LND_READONLY_MACAROON as string,
  LND_READONLY_MACAROON_PATH: process.env.LND_READONLY_MACAROON_PATH as string,
  LND_TLS_CERT: process.env.LND_TLS_CERT as string,
  LND_TLS_CERT_PATH: process.env.LND_TLS_CERT_PATH as string,
  LND_CONNECTION_STRING: process.env.LND_CONNECTION_STRING as string,
};

export default env;
