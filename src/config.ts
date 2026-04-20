import dotenv from 'dotenv';
dotenv.config();

const config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? '',
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET ?? '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? 'gpt-4o',
  PORT: parseInt(process.env.PORT ?? '3001'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

export default config;