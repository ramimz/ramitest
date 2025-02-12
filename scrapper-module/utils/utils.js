const Joi = require("joi");
const { DORCEL_ID, FEMALE_BRANDS, FEMALE_KEYWORDS, MALE_BRANDS, MALE_KEYWORDS, KIDS_BRANDS, KIDS_KEYWORDS } = require("./constants");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const removeMarkdownSection = (markdownContent, title) => {
  const regex = new RegExp(`(#{1,3})\\s*(.*?${title}.*?)\\n[^#]*`, "gi");

  const updatedMarkdown = markdownContent.replace(regex, "");

  return updatedMarkdown;
};

const removeUrlsFromMarkdown = (markdownContent) => {
  const urlRegex = /https?:\/\/[^\s]+/g;

  const updatedMarkdown = markdownContent.replace(urlRegex, "");

  return updatedMarkdown;
};

function handlePrismaError(error) {
  // Check if the error is related to Prisma and contains an error code
  if (error && error.code && error.code.startsWith("P")) {
    switch (error.code) {
      // Case of common errors (P1000 - P1017)
      case "P1000":
        return `Authentication failed: Invalid credentials.`;
      case "P1001":
        return `Cannot reach the database server. Check if the server is running.`;
      case "P1002":
        return `The database server was reached but timed out. Ensure the server is active and accessible.`;
      case "P1003":
        return `Database not found.`;
      case "P1008":
        return `Operation timed out.`;
      case "P1009":
        return `Database already exists.`;
      case "P1010":
        return `Access denied.`;
      case "P1011":
        return `TLS connection error.`;
      case "P1013":
        return `Invalid database connection string.`;
      case "P1014":
        return `Underlying table or view does not exist.`;
      case "P1015":
        return `Database version incompatibility.`;
      case "P1016":
        return `Incorrect number of parameters in query.`;

      // Case of Prisma Client errors (P2000 - P2037)
      case "P2000":
        return `Provided value too long for column.`;
      case "P2001":
        return `Record not found.`;
      case "P2002":
        return `Unique constraint violation.`;
      case "P2003":
        return `Foreign key constraint violation.`;
      case "P2005":
        return `Invalid data in database.`;

      // Case of Prisma migration errors (P3000 - P3022)
      case "P3000":
        return `Failed to create database.`;
      case "P3001":
        return `Migration warning: Destructive changes may result in data loss.`;
      case "P3015":
        return `Migration file not found. Check if the file exists.`;

      // Case of Prisma Accelerate errors (P6000 - P6009)
      case "P6001":
        return `Invalid data source URL; the URL does not follow the prisma:// protocol.`;
      case "P6002":
        return `Unauthorized: Invalid API Key.`;
      case "P6008":
        return `Connection or engine start error. Could not connect to the database.`;

      // Default error for unhandled cases
      default:
        return `An unknown Prisma error occurred: ${
          error.message || "No additional information available."
        }`;
    }
  } else {
    // Case where the error is not a Prisma error
    return `An unknown error occurred: ${
      error.message || "No additional information available."
    }`;
  }
}

const validateProductData = (data) => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      if (
        value === "nan" ||
        value === "None" ||
        value === "" ||
        value === "string" ||
        value === "null"
      ) {
        data[key] = null;
      }
    });

    if(data.offer_id !== DORCEL_ID){
      if(data.availability === "true"){
        data.availability = true
      }
      else if(data.availability === "false"){
        data.availability = false
      }
    }

    const productSchema = Joi.object({
      id_product: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      product_name: Joi.string().required(),
      available_color: Joi.string().optional().allow(null),
      category: Joi.string().optional().allow(null),
      subcategory: Joi.string().optional().allow(null),
      description: Joi.string().optional().allow(null),
      price: Joi.alternatives().try(Joi.string(), Joi.number()).optional().allow(null),
      url: Joi.string().required(),
      id_product_smi: Joi.string().required(),
      offer_id: Joi.number().integer().positive().required(),
      keys: Joi.string().optional().allow(null),
      currency: Joi.string().optional().allow(null),
      availability: Joi.boolean().optional().allow(null),
    });

    const { error } = productSchema.validate(data);
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const isValidLanguageCode = (input) => {
  const lowerCaseInput = input.toLowerCase();
  const regex = /^[a-z]{2}([-_][a-z]{2})?$/;
  return regex.test(lowerCaseInput);
};

/**
 * Get the season of a given timestamp.
 * @param {number} timestamp - The date in milliseconds since the Unix epoch.
 * @returns {string} The corresponding season: 'SPRING', 'SUMMER', 'AUTUMN', or 'WINTER'.
 */
function getSeasonFromTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  const month = date.getUTCMonth() + 1;

  // Define the seasons based on approximate start dates
  if (month >= 3 && month <= 5) {
    return 'SPRING'; // March, April, May
  } else if (month >= 6 && month <= 8) {
      return 'SUMMER'; // June, July, August
  } else if (month >= 9 && month <= 11) {
      return 'AUTUMN'; // September, October, November
  } else {
      return 'WINTER'; // December, January, February
  }
};

function getCurrentSeason() {
  const date = new Date();
  const month = date.getUTCMonth() + 1;

  // Define the seasons based on approximate start dates
  if (month >= 3 && month <= 5) {
    return 'SPRING'; // March, April, May
  } else if (month >= 6 && month <= 8) {
      return 'SUMMER'; // June, July, August
  } else if (month >= 9 && month <= 11) {
      return 'AUTUMN'; // September, October, November
  } else {
      return 'WINTER'; // December, January, February
  }
};

function getSuitableSeasons(currentSeason) {
  const seasonMap = {
    WINTER: ['WINTER', 'AUTUMN'],
    SPRING: ['SPRING', 'SUMMER'],
    SUMMER: ['SUMMER', 'spring'],
    AUTUMN: ['AUTUMN', 'SPRING']
  };

  return seasonMap[currentSeason] || [];
};

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const getGenderFromCivility = (civility) => {
  switch (civility.toLowerCase()) {
  case 'mrs': return 'female';
  case 'mr': return 'male';
  default: return 'other';
  }
};

function detectProductGender(product) {
  const keywords = `${product?.category || ""}/${product?.subCategory || ""}/${product?.keywords || ""}`
  const keywordsArray = keywords ? keywords.toLowerCase()
    .split("/")
    .flatMap(keyword => keyword.split(" ")) : [];

  if (keywordsArray.some(word => FEMALE_KEYWORDS.includes(word))) return "femme";
  if (keywordsArray.some(word => MALE_KEYWORDS.includes(word))) return "homme";
  if (keywordsArray.some(word => KIDS_KEYWORDS.includes(word))) return "enfant";

  return "unisexe";
};

module.exports = {
  wait,
  removeMarkdownSection,
  removeUrlsFromMarkdown,
  handlePrismaError,
  validateProductData,
  isValidLanguageCode,
  getSeasonFromTimestamp,
  getCurrentSeason,
  getSuitableSeasons,
  chunkArray,
  getGenderFromCivility,
  detectProductGender,
};
