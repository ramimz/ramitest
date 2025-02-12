const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError } = require("../utils/utils");

const db = new PrismaClient();

const addArticle = async (data) => {
  try {
    const {
      id,
      createdAt,
      image,
      offerId,
      site,
      tracking_link,
      uid,
      url,
      wishlistId
    } = data;

    const article = await db.articles.create({
      data: {
        id,
      createdAt,
      image,
      offerId,
      site,
      tracking_link,
      uid,
      url,
      wishlistId
    }
    });

    return article;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    //throw new Error(errorMessage);
  }
};

module.exports = { 
    addArticle
};