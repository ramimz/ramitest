const {
  addProduct,
  getAllProducts,
  getProductById,
  getProductByIdSmi,
  getAllProductsIds,
  updateConversionRate,
  getFilteredProducts,
  updateMultipleSales,
  updateMultipleClicks,
  updateMultipleImage,
  updateMultipleCategs,
  getConversionRateByIdProduct,
  updateMultipleConversionRate,
  getProductsWithScore,
  updateMultipleSeason,
  updateMultipleCateg,
  updateMultipleGender,
} = require("../repositories/product.repository.js");

const { 
  getImageByArticleId,
  getSalesByArticleId,
  getDominantSeason,
} = require("../repositories/conversion.repository.js");

const {
    getClicksByArticleId,
} = require("../repositories/click.repository.js");

const {
  getSuitableSeasons,
  getCurrentSeason,
  detectProductGender,
  chunkArray,
} = require("../utils/utils.js");

const {
  fetchInfluencerByUid,
  fetchInfluencerInfos,
} = require("../services/influencer.service.js");

const axios = require("axios");

const createProduct = async (data) => {
    try {
      const result = await addProduct(data);
      return result;
    } catch (error) {
      console.error("Error adding a new product :", error.message);
      throw error;
    }
};

const fetchAllProducts = async () => {
    try {
      const result = await getAllProducts();
      return result.map(res => formatProduct(res));
    } catch (error) {
      console.error("Error getting all products :", error.message);
      throw error;
    }
};

const fetchAllProductsIds = async (data) => {
    try {
      const { options={} } = data;
      const result = await getAllProductsIds(options);
      return result;
    } catch (error) {
      console.error("Error getting all products :", error.message);
      throw error;
    }
};

const fetchProductById = async (data) => {
    try {
      const result = await getProductById(data);
      return formatProduct(result)
    } catch (error) {
      console.error("Error fetching a product :", error.message);
      throw error;
    }
};

const fetchProductByIdSmi = async (data) => {
    try {
      const result = await getProductByIdSmi(data);
      return formatProduct(result);
    } catch (error) {
      console.error("Error adding a new product :", error.message);
      throw error;
    }
};

const editSeason = async (data) => {
  try {
      const idProducts = data.map(item => item.idProduct);
      // const { idProduct } = data;
      // const idProductSmiArray = [];
      // const product = await fetchProductById(idProduct);
      // //if(['femme', 'homme'].)
      // idProductSmiArray.push(product.idProductSmi);
      
      // const duplicatedProducts = await getDuplicatedProductsById(idProduct, product.idProductSmi);
      // for(const duplicatedProduct in duplicatedProducts){
      //   idProductSmiArray.push(duplicatedProduct.idProductSmi);
      // }

      // const season = await getDominantSeason({idProductSmiArray: idProductSmiArray.filter((id) => id !== undefined && id !== null)});
      // await updateSeason({ idProduct, season });
      // return season;
  } catch (error) {
    console.error("Error updating season :", error.message);
    throw error;
  }
};

const editConversionRate = async (data) => {
  try {
      const { idProduct } = data;
      const product = await fetchProductById(idProduct);
      const conversionRate = product.totalClicks == 0 || product.totalSales == 0
      ? 0 
      : Math.round((product.totalSales / product.totalClicks) * 100 * 100) / 100;
      
      await updateConversionRate({ idProduct, conversionRate });
      return conversionRate;
  } catch (error) {
    console.error("Error updating conversion rate :", error.message);
    throw error;
  }
};

const formatProduct = (data) => {
    const {
      brand_id, 
      description_en, 
      display_name, 
      href, 
      is_private_campaign, 
      categories,
      localisation,
      name,
      pic,
      private,
      score,
      influencers,
      is_cpa,
      is_cpc,
      is_cpi,
      language,
      categ,
      brand_clicks,
      brand_sales,
      brand_conversion_rate,
      product_clicks,
      product_sales,
      product_conversion_rate,
      ...others
    } = data;
    
  return {
    ...others,
    total_clicks: product_clicks,
    total_sales: product_sales,
    conversion_rate: product_conversion_rate,
    brand: {
      brand_id, 
      description_en, 
      display_name, 
      href, 
      is_private_campaign, 
      categories,
      localisation,
      name,
      pic,
      private,
      score,
      influencers,
      is_cpa,
      is_cpc,
      is_cpi,
      language,
      categ,
      total_clicks: brand_clicks,
      total_sales: brand_sales,
      conversion_rate: brand_conversion_rate,
    }
  }
};

const classifyAll = async (data) => {
  try{
    const { fileData } = data;
    const products = fileData?.articles || [];
    const updatedProducts = products.map(product => {
      const { id_product_smi, id_categ, id_sub_categ, similarity_score } = product;
      return { id_product_smi, id_categ, id_sub_categ, similarity_score }
    }).filter(item => item.similarity_score > 0)

    console.log('updatedProducts = ', updatedProducts)
    const result = await updateMultipleCategs(updatedProducts);
    return result;
  }
  catch(error){
    throw error;
  }
};

const classify = async (data) => {
  try{
    const apiUrl = `http://localhost:6005/process`;
    console.log('Waiting for classification model...')

    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const results = response.data?.matches;
    return results.map(res => {
      return {
        id_categ: res.id_categ,
        id_product_smi: res.id_product_smi,
        id_sub_categ: res.id_sub_categ,
        similarity_score: res.similarity_score,
      }
    })
  }
  catch(error){
    throw error;
  }
};

const fetchFilteredProducts = async (data) => {
  try {
    const { uid } = data;
    const influencer = await fetchInfluencerByUid(uid);
    console.log('influencer = ', influencer)

    // filter: availability, country, gender, season, privacy
    const currentSeason = getCurrentSeason();
    const seasons = getSuitableSeasons(currentSeason);

    const filteredProducts = await getFilteredProducts({
      uid,
      gender: influencer?.gender,
      country: influencer?.country,
      seasons,
    });

    const result = filteredProducts.map(product => formatProduct(product));

    return result;
  } catch (error) {
    console.error("Error getting filtered products :", error.message);
    throw error;
  }
};

const editMultipleSales = async (data) => {
  try {
      const { idProducts } = data;
      const salesByIdProduct = await getSalesByArticleId(idProducts);
      console.info('All sales retrieved successfully.', salesByIdProduct)
      const result = salesByIdProduct.length > 0 
      ? await updateMultipleSales(salesByIdProduct)
      : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating sales :", error.message);
    throw error;
  }
};

const editMultipleClicks = async (data) => {
  try {
      const { idProducts } = data;
      const clicksByIdProduct = await getClicksByArticleId(idProducts);
      console.info('All clicks retrieved successfully.', clicksByIdProduct)
      const result = clicksByIdProduct.length > 0 
      ? await updateMultipleClicks(clicksByIdProduct)
      : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating clicks :", error.message);
    throw error;
  }
};

const editMultipleImage = async (data) => {
  try {
      const idProducts = data.map(item => item.idProduct);
      const imagesByIdProduct = await getImageByArticleId(idProducts);
      console.info('All images retrieved successfully.', imagesByIdProduct)
      const result = imagesByIdProduct.length > 0
      ? await updateMultipleImage(imagesByIdProduct)
      : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating images :", error.message);
    throw error;
  }
};

const editMultipleConversionRate = async (data) => {
  try {
    const { idProducts } = data;
    const conversionRateByIdProduct = await getConversionRateByIdProduct(idProducts);
    console.info('All conversionRate retrieved successfully.', conversionRateByIdProduct)
    const result = conversionRateByIdProduct.length > 0 
      ? await updateMultipleConversionRate(conversionRateByIdProduct)
      : 'No changes detected.'
    return result
  } catch (error) {
    console.error("Error updating conversion rate :", error.message);
    throw error;
  }
};

const fetchProductsWithScore = async (data) => {
  try {
    const { uid, set, nextProduct, nextScore } = data;
    const influencer = await fetchInfluencerInfos(uid);
    console.log('influencer = ', influencer)

    const currentSeason = getCurrentSeason();
    const seasons = getSuitableSeasons(currentSeason);

    const products = await getProductsWithScore({
      uid,
      inf_offer_ids: influencer?.inf_offer_ids || [],
      gender: influencer?.gender,
      country: influencer?.country,
      seasons,
      set, 
      nextProduct,
      nextScore,
    });

    return products
  } catch (error) {
    console.error("Error getting filtered products :", error.message);
    throw error;
  }
};

const editMultipleSeason = async (data) => {
  try {
      const idProducts = data.map(item => item.idProduct);
      const seasonByIdProduct = await getDominantSeason({ idProducts });
      console.info('All seasons retrieved successfully.', seasonByIdProduct)
      const result = seasonByIdProduct.length > 0 
      ? await updateMultipleSeason(seasonByIdProduct)
      : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating sales :", error.message);
    throw error;
  }
};

const editMultipleCateg = async (data) => {
  try {
      const formattedData = data.map(item => {
        return{
          ...item,
          sub_category: item?.subCategory || item?.sub_category,
          id_product_smi: item?.idProductSmi || item?.id_product_smi,
          product_name: item?.productName || item?.product_name,
        }
      })

      if(formattedData.length === 0) return 'No changes detected.'

      const chunks = chunkArray(formattedData, 10)
      const results = [];
      for(const chunk of chunks){
        const categByIdProduct = await classify(chunk);
        console.info('Chunk categories retrieved successfully.', categByIdProduct)
        const updatedCategs = categByIdProduct.filter(item => item.similarity_score > 0)

        results.push(...updatedCategs)
      }

      console.info('All categories retrieved successfully.', results)
      
      const result = results.length > 0 
      ? await updateMultipleCateg(results)
      : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating categories and subcategories :", error.message);
    throw error;
  }
};

const editMultipleGender = async (data) => {
  try {
      const genderByIdProduct = data.map(item => {
        let gender = detectProductGender(item)

        if(gender === "unisexe"){
          gender = item?.brandGender || "unisexe"
        }
        
        return {
          idProduct: item.idProduct,
          gender,
        }
      });
      console.info('All genders retrieved successfully.', genderByIdProduct)
      const result = genderByIdProduct.length > 0 
      ? await updateMultipleGender(genderByIdProduct)
      : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating product gender :", error.message);
    throw error;
  }
};

module.exports = {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  fetchProductByIdSmi,
  fetchAllProductsIds,
  editSeason,
  editConversionRate,
  classifyAll,
  classify,
  fetchFilteredProducts,
  editMultipleSales,
  editMultipleClicks,
  editMultipleImage,
  editMultipleConversionRate,
  fetchProductsWithScore,
  editMultipleSeason,
  editMultipleCateg,
  editMultipleGender,
};