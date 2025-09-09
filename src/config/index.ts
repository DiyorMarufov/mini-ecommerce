import { config } from "dotenv";
config();

export default {
  PORT: Number(process.env.PORT),
  DB_URL: String(process.env.DB_URL),
  ACCESS_TOKEN_KEY: String(process.env.ACCESS_TOKEN_KEY),
  ACCESS_TOKEN_TIME: String(process.env.ACCESS_TOKEN_TIME),
  REFRESH_TOKEN_KEY: String(process.env.REFRESH_TOKEN_KEY),
  REFRESH_TOKEN_TIME: String(process.env.REFRESH_TOKEN_TIME),
  ADMIN_FULL_NAME: String(process.env.ADMIN_FULL_NAME),
  ADMIN_EMAIL: String(process.env.ADMIN_EMAIL),
  ADMIN_PASSWORD: String(process.env.ADMIN_PASSWORD),
  SMTP_HOST: String(process.env.SMTP_HOST),
  SMTP_USER: String(process.env.SMTP_USER),
  SMTP_PASS: String(process.env.SMTP_PASS),
};
