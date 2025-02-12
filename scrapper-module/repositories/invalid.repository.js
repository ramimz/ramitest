const { PrismaClient } = require("@prisma/client");
const { handlePrismaError } = require("../utils/utils");

const db = new PrismaClient();

const addInvalidProduct = async (data) => {
  try {
    const { url, idProductSmi, offerId, reason } = data;

    const invalid = await db.invalid.create({
      data: {
        url,
        idProductSmi,
        offerId,
        reason,
      },
    });

    return invalid;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = { addInvalidProduct };