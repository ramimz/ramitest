const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError, chunkArray } = require("../utils/utils");

const db = new PrismaClient();

const addProduct = async (data) => {
  try {
    const {
      available_color,
      category,
      description,
      id_product,
      price,
      product_name,
      subcategory,
      url,
      id_product_smi,
      offer_id,
      keys,
      currency,
      availability,
      id_categ,
      id_sub_categ,
    } = data;

    const product = await db.product.create({
      data: {
        color: available_color,
        category,
        description,
        idProduct: id_product,
        price,
        productName: product_name,
        subCategory: subcategory,
        url,
        idProductSmi: id_product_smi,
        offerId: offer_id,
        keywords: keys,
        currency,
        availability,
        idCateg: id_categ,
        idSubCateg: id_sub_categ
      },
    });

    return product;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllProductsSmiIds = async () => {
  try{
    const products = await db.product.findMany({
  		select: { idProductSmi: true },
	  });
    return products.map(p => p.idProductSmi);
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllProducts = async () => {
  try{
    const result = await db.$queryRaw(
        Prisma.sql`
          SELECT
          p.id_product, 
          p.created_at, 
          p.product_name, 
          p.color, 
          p.category, 
          p.sub_category, 
          p.description, 
          p.price, 
          p.currency, 
          p.url, 
          p.id_product_smi, 
          p.offer_id, 
          p.keywords, 
          p.availability, 
          p.id_categ, 
          p.id_sub_categ,
          p.image_url,
          p.season,
          p.product_key,
          p.total_clicks AS "product_clicks",
          p.total_sales AS "product_sales",
          p.conversion_rate AS "product_conversion_rate",
          b.brand_id, 
          b.currency, 
          b.description, 
          b.description_en, 
          b.display_name, 
          b.href, 
          b.is_private_campaign, 
          b.categories, 
          b.localisation, 
          b.name, 
          b.offer_id, 
          b.pic, 
          b.private, 
          b.score, 
          b.influencers, 
          b.is_cpa, 
          b.is_cpc, 
          b.is_cpi, 
          b.language,
          b.total_clicks AS "brand_clicks",
          b.total_sales AS "brand_sales",
          b.conversion_rate AS "brand_conversion_rate",
          array_agg(c.text_fr) AS categ
          FROM product p
          LEFT JOIN brands b ON p.offer_id = b.offer_id
          LEFT JOIN (
            SELECT key, text_fr FROM category_smi
          ) c ON c.key = ANY(b.categ)
          GROUP BY p.product_key, b.brand_id;`
    );
    
    return result;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateCategory = async (data) => {
  const { idProductSmi, category } = data;
  try{
    await db.product.update({
      where: { idProductSmi }, 
      data: { idCateg : category },
    });

    return 'Category added successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateSubcategory = async (data) => {
  const { idProductSmi, subCategory } = data;
  try{
    await db.product.update({
      where: { idProductSmi }, 
      data: { idSubCateg : subCategory },
    });

    return 'Subcategory added successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getProductById = async (idProduct) => {
  try{
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT p.id_product, 
          p.created_at, 
          p.product_name, 
          p.color, 
          p.category, 
          p.sub_category, 
          p.description, 
          p.price, 
          p.currency, 
          p.url, 
          p.id_product_smi, 
          p.offer_id, 
          p.keywords, 
          p.availability, 
          p.id_categ, 
          p.id_sub_categ,
          p.image_url,
          p.season,
          p.id_clusters, 
          p.product_key,
          p.total_clicks AS "product_clicks",
          p.total_sales AS "product_sales",
          p.conversion_rate AS "product_conversion_rate",
          b.brand_id, 
          b.currency, 
          b.description, 
          b.description_en, 
          b.display_name, 
          b.href, 
          b.is_private_campaign, 
          b.categories, 
          b.localisation, 
          b.name, 
          b.offer_id, 
          b.pic, 
          b.private, 
          b.score, 
          b.influencers, 
          b.is_cpa, 
          b.is_cpc, 
          b.is_cpi, 
          b.language,
          b.total_clicks AS "brand_clicks",
          b.total_sales AS "brand_sales",
          b.conversion_rate AS "brand_conversion_rate",
          array_agg(c.text_fr) AS categ,
          jsonb_build_object('id', p.id_categ, 'category_name', cat.category_name) AS id_categ,
          jsonb_build_object('id', p.id_sub_categ, 'subcategory_name', subcat.sub_categ_name) AS id_subcateg
          FROM product p
          LEFT JOIN brands b ON p.offer_id = b.offer_id
          LEFT JOIN (
            SELECT key, text_fr FROM category_smi
          ) c ON c.key = ANY(b.categ)
          LEFT JOIN (
          SELECT id_categ, category_name FROM category
          ) cat ON p.id_categ = cat.id_categ::text
          LEFT JOIN (
            SELECT id_sub_categ, sub_categ_name FROM subcategory
          ) subcat ON p.id_sub_categ = subcat.id_sub_categ::text
          WHERE id_product = ${idProduct}
          GROUP BY p.product_key, b.brand_id, cat.category_name, subcat.sub_categ_name;
        `
      );

    if (result.length === 0) {
      throw new Error(`Product with ID ${idProduct} not found`);
    }
    return result[0]
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getProductByIdSmi = async (idProductSmi) => {
  try{
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT p.id_product, 
          p.created_at, 
          p.product_name, 
          p.color, 
          p.category, 
          p.sub_category, 
          p.description, 
          p.price, 
          p.currency, 
          p.url, 
          p.id_product_smi, 
          p.offer_id, 
          p.keywords, 
          p.availability, 
          p.id_categ, 
          p.id_sub_categ,
          p.image_url,
          p.season,
          p.product_key,
          p.total_clicks AS "product_clicks",
          p.total_sales AS "product_sales",
          p.conversion_rate AS "product_conversion_rate",
          b.brand_id, 
          b.currency, 
          b.description, 
          b.description_en, 
          b.display_name, 
          b.href, 
          b.is_private_campaign, 
          b.categories, 
          b.localisation, 
          b.name, 
          b.offer_id,
          b.pic, 
          b.private, 
          b.score, 
          b.influencers, 
          b.is_cpa, 
          b.is_cpc, 
          b.is_cpi, 
          b.language,
          b.total_clicks AS "brand_clicks",
          b.total_sales AS "brand_sales",
          b.conversion_rate AS "brand_conversion_rate",
          array_agg(c.text_fr) AS categ,
          jsonb_build_object('id', p.id_categ, 'category_name', cat.category_name) AS id_categ,
          jsonb_build_object('id', p.id_sub_categ, 'subcategory_name', subcat.sub_categ_name) AS id_subcateg
          FROM product p
          LEFT JOIN brands b ON p.offer_id = b.offer_id
          LEFT JOIN (
            SELECT key, text_fr FROM category_smi
          ) c ON c.key = ANY(b.categ)
          LEFT JOIN (
          SELECT id_categ, category_name FROM category
          ) cat ON p.id_categ = cat.id_categ::text
          LEFT JOIN (
            SELECT id_sub_categ, sub_categ_name FROM subcategory
          ) subcat ON p.id_sub_categ = subcat.id_sub_categ::text
          WHERE id_product_smi = ${idProductSmi}
          GROUP BY p.product_key, b.brand_id, cat.category_name, subcat.sub_categ_name;
        `
      );

    if (result.length === 0) {
      throw new Error(`Product with ID SMI ${idProductSmi} not found`);
    }

    return result[0]
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateImage = async (data) => {
  const { idProduct, imageUrl } = data;
  try{
    await db.product.update({
      where: { idProduct }, 
      data: { imageUrl },
    });

    return 'Image updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateSeason = async (data) => {
  const { idProduct, season } = data;
  try{
    await db.product.update({
      where: { idProduct }, 
      data: { season },
    });

    return 'Season updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateClicks = async (data) => {
  const { idProduct, totalClicks } = data;
  try{
    await db.product.update({
      where: { idProduct }, 
      data: { totalClicks },
    });

    return 'Total clicks updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateSales = async (data) => {
  const { idProduct, totalSales } = data;
  try{
    await db.product.update({
      where: { idProduct }, 
      data: { totalSales },
    });

    return 'Total sales updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateConversionRate = async (data) => {
  const { idProduct, conversionRate } = data;
  try{
    await db.product.update({
      where: { idProduct }, 
      data: { conversionRate },
    });

    return 'Conversion rate updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllProductsIds = async (data) => {
  try{
    const { image=false, season=false, categ=false, gender=false } = data
    let query = {
      select: { 
        idProduct: true,
        idProductSmi: true,
      },
    }
     
    if(image === true){
      query = {
        select: { 
          idProduct: true,
        },
        where: {
          imageUrl: {
            equals: null
          }
        }
      }
    }
    
    if(season === true){
      query = {
        select: { 
          idProduct: true,
        },
        where: {
          idCateg: {
            in: ['cm67sy6nm0006uz4sqg6ay144', 'cm67sy78d0008uz4satybx3bh'], // idCateg of 'femme' and 'homme' == fashion products
          },
          season: {
            equals: null
          },
        }
      }
    }

    if(categ === true){
      query = {
        select: { 
          idProductSmi: true,
          category: true,
          subCategory: true,
          keywords: true,
          productName: true,
        },
        where: {
          idCateg: {
            equals: null
          },
          idSubCateg: {
            equals: null
          }
        }
      }
    }

    if(gender === true){
      const productsIds =  await db.$queryRaw`
        SELECT 
          p.id_product AS "idProduct", 
          p.offer_id AS "offerId", 
          p.keywords, 
          p.category, 
          p.sub_category AS "subCategory", 
          p.gender AS "productGender",
          b.gender AS "brandGender"
        FROM 
          product p
        JOIN
          brands b ON p.offer_id = b.offer_id
        WHERE
          p.gender IS NULL;
      `;

      return productsIds;
    }

    const productsIds = await db.product.findMany(query);
    return productsIds;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllProductSmiIds = async () => {
  try{
    const result = await db.$queryRaw(
        Prisma.sql`SELECT p.id_product_smi AS "idProductSmi"
        FROM product p
        JOIN failed f ON p.id_product = f.id_product
        WHERE f.id_product_smi != p.id_product_smi;
    `);
    return result;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateClusters = async (data) => {
  const { idProduct, idClusters } = data;
  try{
    await db.product.update({
      where: { idProduct }, 
      data: { idClusters },
    });

    return 'Clusters updated successfully.'
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getFilteredProducts = async (data) => {
  try{
    const { uid, gender, country, seasons } = data;
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT
          p.*, p.total_clicks AS "product_clicks", p.total_sales AS "product_sales", p.conversion_rate AS "product_conversion_rate",
          b.brand_id, b.description_en, b.display_name, b.is_private_campaign, b.pic, b.localisation, b.name, b.private, b.score, b.influencers, b.categ,
          b.total_clicks AS "brand_clicks", b.total_sales AS "brand_sales", b.conversion_rate AS "brand_conversion_rate",
          jsonb_build_object('id', p.id_categ, 'category_name', cat.category_name) AS id_categ,
          jsonb_build_object('id', p.id_sub_categ, 'subcategory_name', subcat.sub_categ_name) AS id_sub_categ,
          array_agg(jsonb_build_object('id', c.key, 'name', c.text_fr)) AS categ
        FROM product p
        LEFT JOIN brands b ON p.offer_id = b.offer_id
        LEFT JOIN (
          SELECT key, text_fr FROM category_smi
        ) c ON c.key = ANY(b.categ)
        LEFT JOIN (
          SELECT id_categ, category_name FROM category
        ) cat ON p.id_categ = cat.id_categ::text
        LEFT JOIN (
          SELECT id_sub_categ, sub_categ_name FROM subcategory
        ) subcat ON p.id_sub_categ = subcat.id_sub_categ::text
        WHERE p.availability = true
        AND (b.localisation LIKE '%' || ${country} || '%' OR b.localisation = 'worldwide')
        AND (p.season IS NULL OR p.season::text = ANY(ARRAY[${Prisma.join(seasons)}]))
        AND (
          cat.category_name NOT IN ('homme', 'femme') 
          OR (cat.category_name = 'homme' AND ${gender} = 'male') 
          OR (cat.category_name = 'femme' AND ${gender} = 'female')
        )
        AND (
          b.private = false 
          OR b.is_private_campaign = false 
          OR EXISTS (
            SELECT 1 FROM unnest(b.influencers) AS inf WHERE inf = ${uid}
          )
        )
        GROUP BY
          p.product_key, 
          b.brand_id, 
          cat.category_name, 
          subcat.sub_categ_name, 
          p.id_categ, 
          p.id_sub_categ;
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

const updateMultipleSales = async (data) => {
  try {
    const chunks = chunkArray(data, 5000)
    for(const chunk of chunks){
      const query = chunk.map(({ idProduct, count }) => {
        return Prisma.sql`WHEN id_product = ${idProduct} THEN ${count}`;
      });
  
      const idProducts = chunk.map(({ idProduct }) => idProduct);
  
      await db.$queryRaw`
        UPDATE product
        SET "total_sales" = CASE
          ${Prisma.join(query, ' ')} 
          ELSE "total_sales"
        END
        WHERE id_product IN (${Prisma.join(idProducts)});
      `;
    }
    
    return 'All products sales updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleClicks = async (data) => {
  try {
    const chunks = chunkArray(data, 5000)
    for(const chunk of chunks){
      const query = chunk.map(({ idProduct, count }) => {
        return Prisma.sql`WHEN id_product = ${idProduct} THEN ${Number(count)}`;
      });
  
      const idProducts = chunk.map(({ idProduct }) => idProduct);
  
      await db.$queryRaw`
        UPDATE product
        SET "total_clicks" = CASE
          ${Prisma.join(query, ' ')} 
          ELSE "total_clicks"
        END
        WHERE id_product IN (${Prisma.join(idProducts)});
      `;
    }

    return 'All products clicks updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleImage = async (data) => {
  try {
    const query = data.map(({ idProduct, imageUrl }) => {
      return Prisma.sql`WHEN id_product = ${idProduct} THEN ${imageUrl}`;
    });

    const idProducts = data.map(({ idProduct }) => idProduct);

    await db.$queryRaw`
      UPDATE product
      SET "image_url" = CASE
        ${Prisma.join(query, ' ')} 
        ELSE "image_url"
      END
      WHERE id_product IN (${Prisma.join(idProducts)});
    `;

    return 'All products images updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleCategs = async (data) => {
  try {
    const chunks = chunkArray(data, 5000);

    for (const chunk of chunks) {
      const firstQuery = chunk.map(({ id_product_smi, id_categ }) => {
        return Prisma.sql`WHEN id_product_smi = ${id_product_smi} THEN ${id_categ}`;
      });
  
      const secondQuery = chunk.map(({ id_product_smi, id_sub_categ }) => {
        return Prisma.sql`WHEN id_product_smi = ${id_product_smi} THEN ${id_sub_categ}`;
      });

      const idProducts = chunk.map(({ id_product_smi }) => id_product_smi);
      await db.$queryRaw`
      UPDATE product
      SET
        "id_categ" = CASE
          ${Prisma.join(firstQuery, ' ')} 
          ELSE "id_categ"
        END,
        "id_sub_categ" = CASE
          ${Prisma.join(secondQuery, ' ')} 
          ELSE "id_sub_categ"
        END
      WHERE id_product_smi IN (${Prisma.join(idProducts)});
      `;
    }
    
    return 'All products categories and subcategories updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getConversionRateByIdProduct = async (idProducts) => {
  try {
    const result = await db.$queryRaw(
      Prisma.sql`
        SELECT 
          id_product AS "idProduct",
          CASE 
            WHEN SUM(total_clicks) = 0 THEN 0
            WHEN (SUM(total_sales) / SUM(total_clicks)) * 100 > 100 THEN 100
            ELSE (SUM(total_sales) / SUM(total_clicks)) * 100
          END AS "conversionRate"
        FROM product
        WHERE id_product IN (${Prisma.join(idProducts)})
        GROUP BY id_product
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
    const chunks = chunkArray(data, 5000);
    for (const chunk of chunks) {
      const query = chunk.map(({ idProduct, conversionRate }) => {
        return Prisma.sql`WHEN id_product = ${idProduct} THEN ${conversionRate}`;
      });
  
      const idProducts = chunk.map(({ idProduct }) => idProduct);
  
      await db.$queryRaw`
        UPDATE product
        SET "conversion_rate" = CASE
          ${Prisma.join(query, ' ')} 
          ELSE "conversion_rate"
        END
        WHERE id_product IN (${Prisma.join(idProducts)});
      `;
    }
    
    return 'All products conversion rate updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getProductsWithScore = async (data) => {
  const { uid, inf_offer_ids, gender, country, seasons, set, nextProduct, nextScore } = data
  console.log('uid = ', uid)
  console.log('inf_offer_ids = ', inf_offer_ids)
  try{
    const infOfferIdsQuery = inf_offer_ids.length > 0 ?
      Prisma.sql`
        CASE
          WHEN fp.offer_id IN (${Prisma.join(inf_offer_ids)})
          THEN true ELSE false
        END AS is_fav_brand
      `
      : Prisma.sql`
        false AS is_fav_brand
      `

    const genderQuery = gender && ['female', 'male'].includes(gender) 
      ? Prisma.sql`
        AND (
          (cat.category_name NOT IN ('homme', 'femme')
          AND subcat.sub_categ_name NOT ILIKE '%homme%' 
          AND subcat.sub_categ_name NOT ILIKE '%femme%') 
          OR (cat.category_name = 'homme' AND (${gender} IS NULL OR ${gender} = 'male') 
            AND subcat.sub_categ_name NOT ILIKE '%femme%') 
          OR (cat.category_name = 'femme' AND (${gender} IS NULL OR ${gender} = 'female') 
            AND subcat.sub_categ_name NOT ILIKE '%homme%')
        )
      ` : Prisma.empty;

    let baseQuery = Prisma.sql`
      WITH filtered_products AS (
          SELECT
              p.id_product,
              p.product_name,
              p.image_url,
              p.offer_id,
              p.id_categ,
              p.id_sub_categ,
              p.total_sales,
              p.conversion_rate,
              p.season,
              p.url,
              jsonb_build_object('id', p.id_categ, 'category_name', cat.category_name) AS categ,
              jsonb_build_object('id', p.id_sub_categ, 'subcategory_name', subcat.sub_categ_name) AS sub_categ,
              b.localisation,
              b.display_name
          FROM product p
          JOIN brands b ON p.offer_id = b.offer_id
          JOIN category cat ON p.id_categ = cat.id_categ::text
          JOIN subcategory subcat ON p.id_sub_categ = subcat.id_sub_categ::text
          WHERE p.availability = true
          AND p.offer_id != 3707
          AND (b.localisation LIKE '%' || ${country} || '%' OR b.localisation = 'worldwide')
          AND (p.season IS NULL OR p.season::text = ANY(ARRAY[${Prisma.join(seasons)}]))
          ${genderQuery}
          AND (
              b.private = false 
              OR b.is_private_campaign = false 
              OR EXISTS (
                  SELECT 1 FROM unnest(b.influencers) AS inf WHERE inf = ${uid}
              )
          )
      ),
      is_sale_brand AS (
          SELECT DISTINCT ON (fp.id_product) 
              fp.id_product,
              CASE
                  WHEN EXISTS (
                      SELECT 1 FROM conversions c 
                      WHERE c.influencer = ${uid} AND c.offerid = fp.offer_id
                  )
                  THEN true ELSE false
              END AS is_sale_brand
          FROM filtered_products fp
      ),
      is_fav_brand AS (
        SELECT DISTINCT ON (fp.id_product)
              fp.id_product,
              ${infOfferIdsQuery}
          FROM filtered_products fp
      ),
      kpis AS (
        SELECT
            k.*
        FROM infs_categ_kpis k
        JOIN filtered_products fp ON fp.categ->>'id' = k.category AND fp.sub_categ->>'id' = k.subcategory
        WHERE k.uid = ${uid}
      ),
      scored_products AS (
        SELECT DISTINCT ON (fp.id_product)
          fp.*,
          COALESCE(kpis.sales_kpi, 0) AS sales_kpi,
          COALESCE(kpis.univers_kpi, 0) AS univers_kpi,
          COALESCE(kpis.infs_themes_kpi, 0) AS infs_themes_kpi,
          is_sale_brand.is_sale_brand,
          is_fav_brand.is_fav_brand,
          -- Calculating score final
          (
              0.3 * COALESCE(kpis.sales_kpi, 0) +
              0.2 * CAST(
                  CASE 
                    WHEN is_sale_brand.is_sale_brand THEN 1 ELSE 0 
                  END AS FLOAT
              ) +
              0.15 * COALESCE(kpis.univers_kpi, 0) + 
              0.10 * COALESCE(kpis.infs_themes_kpi, 0) + 
              0.0005 * COALESCE(fp.conversion_rate, 0) + 
              0.2 * CAST(
                  CASE 
                    WHEN  is_fav_brand.is_fav_brand THEN 1 ELSE 0 
                  END AS FLOAT
              )
          ) * 100 AS score_final

        FROM filtered_products fp
        LEFT JOIN is_sale_brand ON fp.id_product = is_sale_brand.id_product
        LEFT JOIN is_fav_brand ON fp.id_product = is_fav_brand.id_product
        LEFT JOIN kpis ON fp.categ->>'id' = kpis.category AND fp.sub_categ->>'id' = kpis.subcategory
        -- Exclude products already converted by the influencer    
        WHERE fp.id_product NOT IN (
          SELECT id_product FROM conversions c 
          WHERE c.influencer = ${uid} AND id_product IS NOT NULL
        )
        ORDER BY fp.id_product
      )
    `

    const nextProductQuery = nextProduct ? Prisma.sql`
      WHERE (sp.score_final < ${Number(nextScore)} OR (sp.score_final = ${Number(nextScore)} AND sp.id_product > ${nextProduct}))
    ` : Prisma.empty;

    baseQuery = Prisma.sql`${baseQuery} 
      SELECT sp.* FROM scored_products sp
      ${nextProductQuery} ORDER BY sp.score_final DESC, sp.id_product ASC 
      LIMIT ${Number(set)};
    `
    const result = await db.$queryRaw(baseQuery);

    const nextParams = result.length === Number(set) ? {
      nextProduct: result[result.length - 1].id_product,
      nextScore: result[result.length - 1].score_final,
    } : {
      nextProduct: null,
      nextScore: null
    }

    return {
      products: result,
      ...nextParams,
    };
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleSeason = async (data) => {
  try {
    const query = data.map(({ idProduct, season }) => {
      return Prisma.sql`WHEN id_product = ${idProduct} THEN ${season}::season`;
    });

    const idProducts = data.map(({ idProduct }) => idProduct);

    await db.$queryRaw`
      UPDATE product
      SET "season" = CASE
        ${Prisma.join(query, ' ')} 
        ELSE "season"
      END
      WHERE id_product IN (${Prisma.join(idProducts)});
    `;

    return 'All products seasons updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleCateg = async (data) => {
  try {
    const chunks = chunkArray(data, 5000)
    for(const chunk of chunks){
      const queryCategory = chunk.map(({ id_product_smi, id_categ }) => {
        return Prisma.sql`WHEN id_product_smi = ${id_product_smi} THEN ${id_categ}`;
      });

      const querySubCategory = chunk.map(({ id_product_smi, id_sub_categ }) => {
        return Prisma.sql`WHEN id_product_smi = ${id_product_smi} THEN ${id_sub_categ}`;
      });
  
      const idProducts = chunk.map(({ id_product_smi }) => id_product_smi);
  
      await db.$queryRaw`
        UPDATE product
        SET 
          "id_categ" = CASE
            ${Prisma.join(queryCategory, ' ')} 
            ELSE "id_categ"
          END,
          "id_sub_categ" = CASE
            ${Prisma.join(querySubCategory, ' ')}
            ELSE "id_sub_categ"
          END
        WHERE id_product_smi IN (${Prisma.join(idProducts)});
      `;

      console.log('chunk categories and subcategories updated successfully.')
    }
    
    return 'All products categories and subcategories updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateMultipleGender = async (data) => {
  try {
    const chunks = chunkArray(data, 5000)
    for(const chunk of chunks){
      const query = chunk.map(({ idProduct, gender }) => {
        return Prisma.sql`WHEN id_product = ${idProduct} THEN ${gender}`;
      });
  
      const idProducts = chunk.map(({ idProduct }) => idProduct);
  
      await db.$queryRaw`
        UPDATE product
        SET 
          "gender" = CASE
            ${Prisma.join(query, ' ')} 
            ELSE "gender"
          END
        WHERE id_product IN (${Prisma.join(idProducts)});
      `;

      console.log('chunk gender updated successfully.')
    }
    
    return 'All products genders updated successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = { 
  addProduct, 
  getAllProductsSmiIds, 
  getAllProducts,
  updateCategory,
  updateSubcategory,
  getProductById,
  getProductByIdSmi,
  updateImage,
  updateSeason,
  updateClicks,
  updateSales,
  updateConversionRate,
  getAllProductsIds,
  updateClusters,
  getFilteredProducts,
  updateMultipleSales,
  getAllProductSmiIds,
  updateMultipleClicks,
  updateMultipleImage,
  updateMultipleCategs,
  getConversionRateByIdProduct,
  updateMultipleConversionRate,
  getProductsWithScore,
  updateMultipleSeason,
  updateMultipleCateg,
  updateMultipleGender,
};
