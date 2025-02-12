const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError, chunkArray } = require("../utils/utils");

const db = new PrismaClient();

const getClicksByOfferIds = async (offerIds) => {
  try {
    const result = await db.$queryRaw(
      Prisma.sql`SELECT offerid AS "offerId", COUNT(*) AS count
                 FROM clicks
                 WHERE offerid IN (${Prisma.join(offerIds.map(Number))})
                 GROUP BY offerid`
    );
    return result;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getClicksByArticleId = async (idProducts) => {
  try {
    const result = await db.$queryRaw(
        Prisma.sql`SELECT id_product AS "idProduct", COUNT(*) AS count
                     FROM clicks
                     WHERE id_product IN (${Prisma.join(idProducts)})
                     GROUP BY id_product`
    );
    return result;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllClicks = async () => {
  try{
    const clicks = await db.$queryRaw`
      SELECT DISTINCT article FROM clicks WHERE id_product IS NULL;
    `;
    return clicks;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getIdProducts = async (articleIds) => {
  try {
    const chunks = chunkArray(articleIds, 5000);
    const results = [];
    for (const chunk of chunks) {
      const chunkResult = await db.$queryRaw`
        SELECT DISTINCT c.article, p.id_product
        FROM clicks c
        JOIN product p ON c.article = p.id_product_smi
        WHERE p.id_product IS NOT NULL
          AND c.article IN (${Prisma.join(chunk)})

        UNION

        SELECT DISTINCT c.article, f.id_product
        FROM clicks c
        JOIN failed f ON c.article = f.id_product_smi
        WHERE f.id_product IS NOT NULL
          AND c.article IN (${Prisma.join(chunk)});
      `;

      console.log('chunkResult = ', chunkResult);
      results.push(...chunkResult);
    }
    
    return results;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error('error getIdProducts : ', errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleIdProduct = async (data) => {
  try {
    const idProducts = data.map(item => item.article)
    const idProductsByClicks = await getIdProducts(idProducts)
    const chunks = chunkArray(idProductsByClicks, 5000);
    for (const chunk of chunks) {
      const query = chunk.map(({ article, id_product }) => {
        return Prisma.sql`WHEN article = ${article} THEN ${id_product}`;
      });
  
      const keys = chunk.map(({ article }) => article);
  
      await db.$queryRaw`
        UPDATE clicks
        SET "id_product" = CASE
          ${Prisma.join(query, ' ')} 
          ELSE "id_product"
        END
        WHERE article IN (${Prisma.join(keys)});
      `;
    }

    return 'All clicks id product added successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addClick = async (data) => {
  try {
    const {
      key,
      article,
      createdat,
      influencer,
      offerid,
    } = data;

    const clickData = {
      key,
      article,
      createdat,
      influencer,
      offerid,
    }

    // Convert arrays into PostgreSQL array format
    const columns = Object.keys(clickData).join(", ");
    const values = Object.values(clickData).map(value => {
      return `'${value}'`;
    }).join(", ");

    const click = await db.$executeRawUnsafe(`
      INSERT INTO clicks (${columns})
      VALUES (${values})
      RETURNING *;
    `);

    return 'Click added successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const deleteClick = async (clickKey) => {
  try {
    await db.click.delete({
      where: {
        key: clickKey
      },
    });

    return 'Click deleted successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = {
  getClicksByArticleId,
  getClicksByOfferIds,
  getAllClicks,
  updateMultipleIdProduct,
  addClick,
  deleteClick,
};