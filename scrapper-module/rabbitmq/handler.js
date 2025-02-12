const {
  extractData,
  createFailed,
  getPageContent
} = require("../services/scrape.service");

async function processArticleMessage(article) {
  try {
    await extractData(article);
    console.log(`Article processed: ${article.key}`);
  } catch (error) {
    console.error(`Error processing article ${article.key}: ${error.message}`);
  }
}

async function processScrapperMessage(article) {
  try {
    await getPageContent(article);
    console.log(`Article processed: ${article.key}`);
  } catch (error) {
    console.error(`Error processing article ${article.key}: ${error.message}`);
  }
}

module.exports = { processArticleMessage, processScrapperMessage };
