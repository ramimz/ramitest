const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError, chunkArray } = require("../utils/utils");

const db = new PrismaClient();

const getImageByArticleId = async (idProducts) => {
  try {
    const result = await db.$queryRaw(
      Prisma.sql`SELECT articleimgurl AS "imageUrl", id_product AS "idProduct"
                 FROM conversions
                 WHERE id_product IN (${Prisma.join(idProducts)})
                 GROUP BY id_product, articleimgurl`
    );
    return result;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getSalesByArticleId = async (idProducts) => {
  try {
    const result = await db.$queryRaw(
      Prisma.sql`SELECT id_product AS "idProduct", COUNT(*) AS count
                 FROM conversions
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

const getAllConversions = async (data) => {
  const { season, idProduct } = data;
  try{
    let query = {
      select: {
        key: true
      },
    }

    if(season === true){
      query = {
        select: {
          key: true,
          createdat: true,
        },
        where: {
          season: {
            equals: null
          }
        },
      }
    }

    if(idProduct === true){
      query = {
        select: {
          articleid: true
        },
        where: {
          idProduct: {
            equals: null
          }
        },
        distinct: ['articleid']
      }
    }
    const conversions = await db.conversion.findMany(query);    
    return conversions;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getDominantSeason = async (data) => {
  try {
    const { idProducts } = data;

    const result = await db.$queryRaw`
      SELECT id_product, season
      FROM (
        SELECT id_product, season, COUNT(*) AS season_count
        FROM conversions
        WHERE id_product IN (${Prisma.join(idProducts)})
        GROUP BY id_product, season
      ) AS season_counts
      WHERE (id_product, season_count) IN (
        SELECT id_product, MAX(season_count) FROM (
          SELECT id_product, season, COUNT(*) AS season_count
          FROM conversions
          WHERE id_product IN (${Prisma.join(idProducts)})
          GROUP BY id_product, season
        ) AS max_seasons
        GROUP BY id_product
      )
    `;

    const dominantSeasons = result.map((row) => ({
      idProduct: row.id_product,
      season: row.season,
    }));

    return dominantSeasons;
  } catch (error) {
      console.error('Error calculating dominant season:', error.message);
      throw error;
  }
};

const getSalesByOfferIds = async (offerIds) => {
  try {
    const result = await db.$queryRaw(
      Prisma.sql`SELECT offerid AS "offerId", COUNT(*) AS count
                 FROM conversions
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

const updateMultipleSeasons = async (data) => {
  try {
    const chunks = chunkArray(data, 5000);
    for (const chunk of chunks) {
      const query = chunk.map(({ key, season }) => {
        return Prisma.sql`WHEN key = ${key} THEN ${season}::season`;
      });
  
      const keys = chunk.map(({ key }) => key);
  
      await db.$queryRaw`
        UPDATE conversions
        SET "season" = CASE
          ${Prisma.join(query, ' ')} 
          ELSE "season"
        END
        WHERE key IN (${Prisma.join(keys)});
      `;

      console.log('Chunk season updated successfully.');
    }

    return 'All conversions season updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getIdProducts = async (articleIds) => {
  try {
    const chunks = chunkArray(articleIds, 15000);
    const results = [];
    for (const chunk of chunks) {
      const chunkResult = await db.$queryRaw`
        SELECT DISTINCT c.articleid, p.id_product
        FROM conversions c
        LEFT JOIN product p ON c.articleid = p.id_product_smi
        WHERE p.id_product IS NOT NULL
          AND c.articleid IN (${Prisma.join(chunk)})

        UNION

        SELECT DISTINCT c.articleid, f.id_product
        FROM conversions c
        LEFT JOIN failed f ON c.articleid = f.id_product_smi
        WHERE f.id_product IS NOT NULL
          AND c.articleid IN (${Prisma.join(chunk)});
      `;

      console.log('chunkResult = ', chunkResult);

      results.push(...chunkResult);
    }
    
    return results;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleIdProduct = async (data) => {
  try {
    const chunks = chunkArray(data, 5000);
    for (const chunk of chunks) {
      const query = chunk.map(({ articleid, id_product }) => {
        return Prisma.sql`WHEN articleid = ${articleid} THEN ${id_product}`;
      });
  
      const keys = chunk.map(({ articleid }) => articleid);
  
      await db.$queryRaw`
        UPDATE conversions
        SET "id_product" = CASE
          ${Prisma.join(query, ' ')} 
          ELSE "id_product"
        END
        WHERE articleid IN (${Prisma.join(keys)});
      `;
    }

    return 'All conversions id product added successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addConversion = async (data) => {
  try {
    const {
      key,
      influencer, 
      offerid, 
      clickid, 
      amount, 
      articleid, 
      articleimgurl, 
      articlepathurl, 
      brandkey, 
      categ, 
      subcateg, 
      maincolor, 
      createdat, 
      lastmodified, 
      countrycode, 
      currency, 
      isprivate, 
      status=2, 
      paiement_status=false, 
      referral_influencer, 
      smi_sales_payment_status=2, 
      smi_referral_payment_status=2,
    } = data;

    const conversionData = {
      key,
      influencer, 
      offerid, 
      clickid, 
      amount, 
      articleid, 
      articleimgurl, 
      articlepathurl, 
      brandkey, 
      categ, 
      subcateg, 
      maincolor, 
      createdat, 
      lastmodified, 
      countrycode, 
      currency, 
      isprivate, 
      status, 
      paiement_status, 
      referral_influencer, 
      smi_sales_payment_status, 
      smi_referral_payment_status,
    }

    // Convert arrays into PostgreSQL array format
    const columns = Object.keys(conversionData).join(", ");
    const values = Object.values(conversionData).map(value => {
      return `'${value}'`;
    }).join(", ");

    const conversion = await db.$executeRawUnsafe(`
      INSERT INTO conversions (${columns})
      VALUES (${values})
      RETURNING *;
    `);

    return 'Conversion added successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = { 
  getImageByArticleId,
  getSalesByArticleId,
  getAllConversions,
  getDominantSeason,
  getSalesByOfferIds,
  updateMultipleSeasons,
  getIdProducts,
  updateMultipleIdProduct,
  addConversion,
};