const { PrismaClient } = require("@prisma/client");
const { handlePrismaError } = require("../utils/utils");

const db = new PrismaClient();

const getAllUniverses = async () => {
  try{
    const universes = await db.universes.findMany();
    return universes;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getUniverseByKey = async (universeKey) => {
  try{
    const universe = await db.universes.findUnique({
      select: {
        key: true,
        text_fr: true,
      },
      where: {
        key: universeKey
      },
    });

    return universe;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = { 
  getAllUniverses,
  getUniverseByKey,
};