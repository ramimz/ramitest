const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError } = require("../utils/utils");
const { equal } = require("joi");

const db = new PrismaClient();

const getBrandByOfferId = async (offerId) => {
  try{
    const brand = await db.brand.findFirst({
      where: {
        offer_id: offerId
      },
    });

    return brand;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getBrandByBrandKey = async (brandKey) => {
  try{
    const brand = await db.brand.findUnique({
      where: {
        brand_id: brandKey
      },
    });

    if (!brand) {
      throw new Error(`Product with ID ${brandKey} not found`);
    }

    return brand;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllBrands = async () => {
  try{
    const brands = await db.brand.findMany();
    return brands;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllBrandsKeys = async () => {
  try{
    const brands = await db.brand.findMany({
      select: {
        offer_id: true
      }
    });
    return brands;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addBrand = async (data) => {
  try {
    const {
      brand_id,
      currency,
      description,
      description_en,
      display_name,
      href,
      is_private_campaign=false,
      categories={},
      localisation,
      name,
      offer_id,
      pic,
      private=false,
      score,
      influencers=[],
      is_cpa=false,
      is_cpc=false,
      is_cpi=false,
      language,
      categ=[],
    } = data;

    const brandData = {
      brand_id,
      currency,
      description,
      description_en,
      display_name,
      href,
      is_private_campaign,
      categories,
      localisation,
      name,
      offer_id,
      pic,
      private,
      score,
      influencers,
      is_cpa,
      is_cpc,
      is_cpi,
      language,
      categ,
    };

    // Convert arrays into PostgreSQL array format
    const columns = Object.keys(brandData).join(", ");
    const values = Object.values(brandData).map(value => {
      // If the value is an array, format it as a PostgreSQL array
      if (value && Array.isArray(value)) {
        return `'${`{${value.join(",")}}`}'`;  // Syntax for arrays in PostgreSQL
      }
      // If the value is an object, stringify it to store it as JSON
      if (value && typeof value === 'object') {
        return `'${JSON.stringify(value)}'`;
      }
      // Handle other data types (String, Number, Boolean, etc.)
      return `'${value}'`;
    }).join(", ");
    const brand = await db.$executeRawUnsafe(`
      INSERT INTO brands (${columns})
      VALUES (${values})
      RETURNING *;
    `);

    return 'Brand added successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const deleteBrand = async (brandKey) => {
  try {
    await db.brand.delete({
      where: {
        brand_id: brandKey
      },
    });

    return 'Brand deleted successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateBrand = async (data) => {
  try {
    const { brandKey, updates } = data;
    const updatedBrand = await db.brand.update({
      where: {
        brand_id: brandKey
      },
      data: updates
    });

    return updatedBrand;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleClicks = async (data) => {
  try {
    const query = data.map(({ offerId, count }) => {
      return Prisma.sql`WHEN offer_id = ${offerId} THEN ${count}`;
    });

    const offerIds = data.map(({ offerId }) => offerId);

    await db.$queryRaw`
      UPDATE brands
      SET "total_clicks" = CASE
        ${Prisma.join(query, ' ')} 
        ELSE "total_clicks"
      END
      WHERE offer_id IN (${Prisma.join(offerIds)});
    `;

    return 'All brands clicks updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleSales = async (data) => {
  try {
    const query = data.map(({ offerId, count }) => {
      return Prisma.sql`WHEN offer_id = ${offerId} THEN ${count}`;
    });

    const offerIds = data.map(({ offerId }) => offerId);

    await db.$queryRaw`
      UPDATE brands
      SET "total_sales" = CASE
        ${Prisma.join(query, ' ')} 
        ELSE "total_sales"
      END
      WHERE offer_id IN (${Prisma.join(offerIds)});
    `;

    return 'All brands sales updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getConversionRateByOfferIds = async (offerIds) => {
  try {
    const result = await db.$queryRaw(
        Prisma.sql`
          SELECT 
            offer_id AS "offerId", 
            CASE 
              WHEN SUM(total_clicks) = 0 THEN 0
              WHEN (SUM(total_sales) / SUM(total_clicks)) * 100 > 100 THEN 100
              ELSE (SUM(total_sales) / SUM(total_clicks)) * 100
            END AS "conversionRate"
          FROM brands
          WHERE offer_id IN (${Prisma.join(offerIds.map(Number))})
          GROUP BY offer_id
        `
    );
    return result;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleConversionRate = async (data) => {
  try {
    const query = data.map(({ offerId, conversionRate }) => {
      return Prisma.sql`WHEN offer_id = ${offerId} THEN ${conversionRate}`;
    });

    const offerIds = data.map(({ offerId }) => offerId);

    await db.$queryRaw`
      UPDATE brands
      SET "conversion_rate" = CASE
        ${Prisma.join(query, ' ')} 
        ELSE "conversion_rate"
      END
      WHERE offer_id IN (${Prisma.join(offerIds)});
    `;

    return 'All brands conversion rate updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleGender = async () => {
  try {
    await db.$queryRaw`
      UPDATE brands
      SET gender = CASE
      -- If the brand is feminine
      WHEN EXISTS (
          SELECT 1 
          FROM UNNEST(categ) AS element 
          WHERE element IN (
              '-MVVjqB0bnq2XEnBltNY',
              '-MVVjqB-K4ly_OF7uviz', 	
              '-MkDF5C53fiZ6P_pC57x', 
              '-MkDHckmpYdKzYsm45Te'
          )
      )
      AND '-MVVjqB0bnq2XEnBltNZ' <> ALL(categ)
      THEN 'femme'

      -- If the brand is masculine
      WHEN EXISTS (
        SELECT 1 
        FROM UNNEST(categ) AS element 
        WHERE element IN ('-MVVjqB0bnq2XEnBltNZ')
      )
      AND '-M_CURbKPKWUOChBEKuA' <> ALL(categ)
      AND '-MVVjqB0bnq2XEnBltNY' <> ALL(categ) 
      THEN 'homme'

      -- If it's kids brand
      WHEN EXISTS (
        SELECT 1 
        FROM UNNEST(categ) AS element 
        WHERE element IN (
        '-M_CURbKPKWUOChBEKuA', 	
        '-Mkh37LNmziSuCYvtmKw'
        )
      )
      AND '-MVVjqB0bnq2XEnBltNZ' <> ALL(categ)
      AND '-MVVjqB0bnq2XEnBltNY' <> ALL(categ)
      THEN 'enfant'

      ELSE 'unisexe'
      END;
    `;

    return 'All brands gender updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = { 
  getBrandByOfferId,
  getBrandByBrandKey,
  getAllBrands,
  getAllBrandsKeys,
  addBrand,
  deleteBrand,
  updateBrand,
  updateMultipleClicks,
  updateMultipleSales,
  getConversionRateByOfferIds,
  updateMultipleConversionRate,
  updateMultipleGender,
};