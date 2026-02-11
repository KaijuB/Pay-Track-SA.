const dotenv = require('dotenv');

dotenv.config({ path: process.env.DOTENV_PATH || undefined });

const required = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env var: ${k}`);
  return v;
};

const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev_insecure_change_me',
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY || null,
};

module.exports = { config, required };
