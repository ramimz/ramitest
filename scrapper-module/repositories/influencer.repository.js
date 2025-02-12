const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError } = require("../utils/utils");

const db = new PrismaClient();
const cuid = require('cuid');

const getAllInfluencers = async () => {
    try{
      const result = await db.$queryRaw(
        Prisma.sql`
          SELECT i.*, e.influence_themes, e.activities,
           array_agg(u.text_fr) AS univers
          FROM influencers i
          LEFT JOIN infs_extra_data e ON i.uid = e.key
          LEFT JOIN (
            SELECT key, text_fr FROM universes
            UNION
            SELECT key, text_fr FROM category_smi
          ) u ON u.key = ANY(i.univers)
          GROUP BY i.uid, e.key;
        `
      );

      return result;
    }
    catch(error){
      const errorMessage = handlePrismaError(error);
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
};

const getAllInfluencersUid = async (data) => {
  const { options } = data;
  try{
    const query = options?.gender === true
      ? Prisma.sql`
          SELECT i.uid, i.civility, e.gender
          FROM influencers i
          LEFT JOIN infs_extra_data e ON i.uid = e.key
          WHERE i.gender IS NULL
          GROUP BY i.uid, e.key;
        `
      : Prisma.sql`
          SELECT uid FROM influencers;
        `;

    const result = await db.$queryRaw(query);
    return result;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getInfluencerByUid = async (uid) => {
  try{
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT 
          i.*, 
          e.activities,
          array_agg(
            jsonb_build_object(
              'id_categ', c.id_categ, 
              'category_name', c.category_name
            )
          ) AS univers,
          array_agg(
            jsonb_build_object(
              'influence_theme', theme_data.influence_themes, 
              'id_categ', theme_data.id_categ, 
              'category_name', theme_data.category_name
            )
          ) AS influence_themes,
          array_agg(
            jsonb_build_object(
              'brand_id', b.brand_id, 
              'offer_id', b.offer_id,
              'display_name', b.display_name
            )
          ) AS favorite_brands_ids
        FROM 
          influencers i
        LEFT JOIN 
          infs_extra_data e ON i.uid = e.key
        LEFT JOIN (
          SELECT 
            cat.id_categ, 
            cat.category_name, 
            cs.key AS id_categ_smi
          FROM 
            category cat
          LEFT JOIN 
            category_smi cs ON cs.key = ANY(cat.id_categ_smi)
        ) c ON c.id_categ_smi = ANY(i.univers)
        LEFT JOIN (
          SELECT 
            inf.influence_themes, 
            cat.id_categ, 
            cat.category_name
          FROM 
            infs_theme_categ inf
          LEFT JOIN 
            category cat ON cat.id_categ = ANY(inf.id_categ)
        ) theme_data ON theme_data.influence_themes = ANY(e.influence_themes)
        LEFT JOIN (
          SELECT 
            brand_id, offer_id, display_name
          FROM 
            brands
        ) b ON b.brand_id::TEXT IN (SELECT jsonb_object_keys(i.favorite_brands_ids))
        WHERE 
          i.uid = ${uid}
        GROUP BY 
          i.uid, e.activities;
      `
    );

    return Object.values(result)[0];
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateGender = async (data) => {
  const { uid, gender } = data;
  try{
    await db.influencer.update({
      where: { uid }, 
      data: { gender },
    });

    return 'Gender updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getInfluencerExtraData = async (uid) => {
    try{
      const influencerExtraData = await db.infExtraData.findUnique({
        where: {
          key: uid
        },
      });
  
      return influencerExtraData;
    }
    catch(error){
      const errorMessage = handlePrismaError(error);
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
};

const updateCluster = async (data) => {
  const { uid, idCluster } = data;
  try{
    await db.influencer.update({
      where: { uid }, 
      data: { idCluster },
    });

    return 'Cluster updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getConversionsByUid = async (uid) => {
  try{
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT
        c.id_product,
        COUNT(*) AS "totalSales",
        SUM(c.amount) AS "totalAmount",
        COALESCE(AVG(c.amount), 0) AS "moy",
        p.url,
        p.offer_id,
        jsonb_build_object('id', p.id_categ, 'category_name', cat.category_name) AS category,
        jsonb_build_object('id', p.id_sub_categ, 'subcategory_name', subcat.sub_categ_name) AS subcategory
        FROM conversions c
        JOIN product p ON c.id_product = p.id_product
        LEFT JOIN category cat ON p.id_categ = cat.id_categ::text
        LEFT JOIN subcategory subcat ON p.id_sub_categ = subcat.id_sub_categ::text
        WHERE c.influencer = ${uid}
        GROUP BY c.id_product, p.id_categ, cat.category_name, p.id_sub_categ, subcat.sub_categ_name, p.url, p.offer_id
      `
    );

    return result;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleGender = async (data) => {
  try {
    const query = data.map(({ uid, gender }) => {
      return Prisma.sql`WHEN uid = ${uid} THEN ${gender}`;
    });

    const ids = data.map(({ uid }) => uid);

    await db.$queryRaw`
      UPDATE influencers
      SET "gender" = CASE
        ${Prisma.join(query, ' ')} 
        ELSE "gender"
      END
      WHERE uid IN (${Prisma.join(ids)});
    `;

    return 'All influencers gender updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateSalesKpiByUid = async (data) => {
  const { salesKpiByUid } = data;
  try {
    const values = salesKpiByUid.map((item) => [
      cuid(),
      item.uid,
      item.id_categ,
      item.id_sub_categ,
      Number(item.sales_kpi),
    ]);

    const placeholders = values
    .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5}::double precision)`)
    .join(', ');

    const flatValues = values.flat();

    await db.$executeRawUnsafe(
      `
      INSERT INTO infs_categ_kpis (key, uid, category, subcategory, sales_kpi)
      VALUES ${placeholders}
      ON CONFLICT (uid, category, subcategory)
      DO UPDATE SET
        sales_kpi = EXCLUDED.sales_kpi;
      `,
      ...flatValues
    );

    return 'Influencer sales kpi updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getKpiByUid = async (data) => {
  const { uid } = data;
  try {
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT
        inf.uid,
        jsonb_build_object('id_categ', c.id_categ, 'category_name', c.category_name) AS category,
        jsonb_build_object('id_sub_categ', s.id_sub_categ, 'subcategory_name', s.sub_categ_name) AS subcategory,
        inf.sales_kpi,
        inf.univers_kpi,
        inf.infs_themes_kpi
        FROM infs_categ_kpis inf
        LEFT JOIN category c ON c.id_categ::text = inf.category
        LEFT JOIN subcategory s ON s.id_sub_categ::text = inf.subcategory
        WHERE inf.uid = ${uid}
        GROUP BY inf.key, c.id_categ, s.id_sub_categ
        ORDER BY inf.sales_kpi DESC;
      `
    );

    return result;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateUniversInfsThemeKpisByUid = async (data) => {
  const { kpisByUid } = data;
  try {
    const values = kpisByUid.map((item) => [
      cuid(),
      item.uid,
      item.id_categ,
      item.id_sub_categ,
      Number(item.univers_kpi),
      Number(item.infs_themes_kpi),
    ]);

    const placeholders = values
    .map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}::double precision, $${i * 6 + 6}::double precision)`)
    .join(', ');

    const flatValues = values.flat();

    await db.$executeRawUnsafe(
      `
      INSERT INTO infs_categ_kpis (key, uid, category, subcategory, univers_kpi, infs_themes_kpi)
      VALUES ${placeholders}
      ON CONFLICT (uid, category, subcategory)
      DO UPDATE SET
        univers_kpi = EXCLUDED.univers_kpi,
        infs_themes_kpi = EXCLUDED.infs_themes_kpi;
      `,
      ...flatValues
    );

    return 'Influencer universe and influence themes kpis updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addInfluencer = async (data) => {
  try {
    const {
      uid, 
      banner, 
      civility, 
      community_size={}, 
      country, 
      description, 
      email, 
      first_name, 
      language, 
      last_name, 
      name, 
      private, 
      score, 
      univers, 
      favorite_brands_ids=[], 
      is_deleted = false,
    } = data;

    const infData = {
      uid, 
      banner, 
      civility, 
      community_size, 
      country, 
      description, 
      email, 
      first_name, 
      language, 
      last_name, 
      name, 
      private, 
      score, 
      univers, 
      favorite_brands_ids, 
      is_deleted
    };

    // Convert arrays into PostgreSQL array format
    const columns = Object.keys(infData).join(", ");
    const values = Object.values(infData).map(value => {
      // If the value is an array, format it as a PostgreSQL array
      if (Array.isArray(value)) {
        return `'${`{${value.join(",")}}`}'`;  // Syntax for arrays in PostgreSQL
      }
      // If the value is an object, stringify it to store it as JSON
      if (typeof value === 'object') {
        return `'${JSON.stringify(value)}'`;
      }
      // Handle other data types (String, Number, Boolean, etc.)
      return `'${value}'`;
    }).join(", ");
    const influencer = await db.$executeRawUnsafe(`
      INSERT INTO influencers (${columns})
      VALUES (${values})
      RETURNING *;
    `);

    return "Influencer created successfully.";
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateInfluencer = async (data) => {
  try {
    const { uid, updates } = data;
    const updatedInfluencer = await db.influencer.update({
      where: {
        uid
      },
      data: updates
    });

    return updatedInfluencer;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addInfluencerExtraData = async (data) => {
  try {
    const {
      key, 
      gender, 
      influence_themes=[], 
      activities=[]
    } = data;

    const infData = {
      key, 
      gender, 
      influence_themes, 
      activities
    };

    // Convert arrays into PostgreSQL array format
    const columns = Object.keys(infData).join(", ");
    const values = Object.values(infData).map(value => {
      // If the value is an array, format it as a PostgreSQL array
      if (Array.isArray(value)) {
        return `'${`{${value.join(",")}}`}'`;  // Syntax for arrays in PostgreSQL
      }
      // If the value is an object, stringify it to store it as JSON
      if (typeof value === 'object') {
        return `'${JSON.stringify(value)}'`;
      }
      // Handle other data types (String, Number, Boolean, etc.)
      return `'${value}'`;
    }).join(", ");
    const influencer = await db.$executeRawUnsafe(`
      INSERT INTO infs_extra_data (${columns})
      VALUES (${values})
      RETURNING *;
    `);

    return "Influencer extra data created successfully.";
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateInfluencerExtraData = async (data) => {
  try {
    const { uid, updates } = data;
    const updatedInfluencer = await db.infExtraData.update({
      where: {
        key: uid
      },
      data: updates
    });

    return updatedInfluencer;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getInfluencerInfos = async (uid) => {
  try{
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT 
          i.uid,
          i.gender,
          i.country,
          COALESCE(
              array_agg(b.offer_id) FILTER (WHERE b.brand_id IS NOT NULL), 
              '{}'::INT[]
          ) AS inf_offer_ids
        FROM 
          influencers i
        LEFT JOIN brands b ON b.brand_id::TEXT IN (SELECT jsonb_object_keys(i.favorite_brands_ids))
        WHERE 
          i.uid = ${uid}
        GROUP BY 
          i.uid;
      `
    );

    return Object.values(result)[0];
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = { 
  getAllInfluencers,
  getInfluencerByUid,
  updateGender,
  getInfluencerExtraData,
  getAllInfluencersUid,
  updateCluster,
  getConversionsByUid,
  updateMultipleGender,
  updateSalesKpiByUid,
  getKpiByUid,
  updateUniversInfsThemeKpisByUid,
  addInfluencer,
  updateInfluencer,
  addInfluencerExtraData,
  updateInfluencerExtraData,
  getInfluencerInfos,
};