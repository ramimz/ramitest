const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError } = require("../utils/utils");

const db = new PrismaClient();

const addFailedProduct = async (data) => {
  try {
    const { url, idProductSmi, offerId, errorMessage, idProduct } = data;

    // Check if the failed product already exists
    const existingFailedProduct = await db.failed.findUnique({
      where: { idProductSmi },
      select: { retryCount: true },
    });

    const retryCount = existingFailedProduct ? existingFailedProduct.retryCount + 1 : 0;

    const failed = await db.failed.upsert({
      where: { idProductSmi },
      create: {
        url,
        idProductSmi,
        offerId,
        errorMessage,
        retryCount,
        idProduct,
      },
      update: {
        errorMessage,
        retryCount,
        idProduct,
      },
    });

    return failed;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getUnresolvedFailedIds = async () => {
  try{
    const unresolvedFailed = await db.failed.findMany({
  		select: { idProductSmi: true },
      where : {
        resolved : false,
      }
	  });
    return unresolvedFailed.map(f => f.idProductSmi);
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const setResolvedFailed = async (data) => {
  try{
    await db.failed.updateMany({
      where: {
        idProductSmi: {
          in: data
        }
      },
      data: {
        resolved: true,
        ignore: true
      }
    });

    return 'Resolved failed set successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const setIgnoreFailed = async () => {
  try{
    const ignoreErrorMessages = [
      `"id_product" must be one of [string, number]`,
      `Cannot destructure property 'content' of '(intermediate value)' as it is undefined.`,
      `Unique constraint violation.`
    ];
    await db.failed.updateMany({
      where: {
        OR: [
          {
            errorMessage: {
              in: ignoreErrorMessages
            },
            ignore: false
          },
          {
            retryCount: {
              gte: 3  // retryCount >= 3
            },
            ignore: false
          },
          {
            resolved: true,
            ignore: false
          }
        ]
      },
      data: {
        ignore: true
      }
    });

    return 'Ignored failed set successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getUnresolvedFailed = async () => {
  try{
    const skippedIds = [
      11, 1077, 1460, 1579, 1978, 2616, 3824, 935, 55450290, 2640, 3888, 3138, 1030, 34
    ];
    const unresolvedFailed = await db.failed.findMany({
      select: {
        url: true,
        idProductSmi: true,
        offerId: true,
      },
      where : {
        resolved : false,
        ignore: false,
        retryCount: { lte: 2 },
        offerId: {
          notIn: skippedIds
        },
      }
	  });

    const uniqueFailedItems = {};
    unresolvedFailed.forEach(item => {
      uniqueFailedItems[item.idProductSmi] = {
        url: item.url,
        key: item.idProductSmi,
        offerid: item.offerId
      };
    });

    return Object.values(uniqueFailedItems);
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateIdProduct = async (data) => {
  const { idProductSmi, idProduct } = data;
  try{
    await db.failed.update({
      where: { idProductSmi }, 
      data: { idProduct },
    });

    return 'Id product added successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getDuplicatedProductsById = async (idProducts, idProductsSmi) => {
  try{
    const result = await db.$queryRaw(
          Prisma.sql`SELECT DISTINCT(id_product_smi) AS "idProductSmi",
                     FROM failed
                     WHERE id_product IN (${Prisma.join(idProducts)})
                     AND id_product_smi NOT IN (${Prisma.join(idProductsSmi)})`
    );
    return result;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = { 
  addFailedProduct, 
  getUnresolvedFailedIds, 
  setResolvedFailed, 
  setIgnoreFailed,
  getUnresolvedFailed,
  updateIdProduct,
  getDuplicatedProductsById
};
