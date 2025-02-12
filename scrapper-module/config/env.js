const { cleanEnv, num, str } = require("envalid");

const env = cleanEnv(process.env, {
  SCRAPER_MAX_ATTEMPTS: num(),
  BROWSER_TIMEOUT: num(),
  PAGE_TIMEOUT: num(),
  RETRY_BASE_DELAY: num(),
  EXTRACTION_TIMEOUT: num(),
  RABBITMQ_URL: str(),
  RABBITMQ_DEFAULT_USER: str(),
  RABBITMQ_DEFAULT_PASS: str(),
  NODE_ENV: str(),
  SCRAPPER_MODULE_PORT: num(),
  LLM_MODULE_PORT: num(),
  AMQP_PROTOCOL_PORT: num(),
  MANAGEMENT_UI_PORT: num(),
  LLM_API_URL: str(),
  LLM_MAX_ATTEMPTS: num(),
  GEMINI_API_KEYS: str(),
  DATABASE_URL: str(),
  KPI_API_URL: str(),
});

module.exports = env;