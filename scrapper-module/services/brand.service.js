const {
  getBrandByOfferId,
  getBrandByBrandKey,
  getAllBrands,
  addBrand,
  deleteBrand,
  updateBrand,
  updateMultipleClicks,
  updateMultipleSales,
  getConversionRateByOfferIds,
  updateMultipleConversionRate,
} = require("../repositories/brand.repository.js");

const {
  getClicksByOfferIds,
} = require("../repositories/click.repository.js");

const {
  getSalesByOfferIds,
} = require("../repositories/conversion.repository.js");

const fetchAllBrands = async () => {
    try {
      const result = await getAllBrands();
      return result;
    } catch (error) {
      console.error("Error getting all brands :", error.message);
      throw error;
    }
};

const fetchBrandByOfferId = async (data) => {
    try {
      const result = await getBrandByOfferId(Number(data));
      return result;
    } catch (error) {
      console.error("Error fetching a brand :", error.message);
      throw error;
    }
};

const fetchBrandByKey = async (data) => {
    try {
      const result = await getBrandByBrandKey(data);
      return result;
    } catch (error) {
      console.error("Error fetching a brand :", error.message);
      throw error;
    }
};

const createBrand = async (data) => {
  try {
      const brand = await addBrand(data);
      return brand;
  } catch (error) {
    console.error("Error creating a new brand :", error.message);
    throw error;
  }
};

const removeBrand = async (data) => {
  try {
    const { brandKey } = data;
    const result = await deleteBrand(brandKey);
    return result;
  } catch (error) {
    console.error("Error deleting a brand :", error.message);
    throw error;
  }
};

const editBrand = async (data) => {
  try {
    const brand = await updateBrand(data);
    return brand;
  } catch (error) {
    console.error("Error editing a brand :", error.message);
    throw error;
  }
};

const editMultipleClicks = async (data) => {
  try {
      const { offerIds } = data;
      const clicksByOfferId = await getClicksByOfferIds(offerIds);
      console.info('All clicks retrieved successfully.')
      const result = clicksByOfferId.length > 0
        ? await updateMultipleClicks(clicksByOfferId)
        : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating clicks :", error.message);
    throw error;
  }
};

const editMultipleSales = async (data) => {
  try {
      const { offerIds } = data;
      const salesByOfferId = await getSalesByOfferIds(offerIds);
      console.info('All sales retrieved successfully.')
      const result = salesByOfferId.length > 0 
      ? await updateMultipleSales(salesByOfferId)
      : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating sales :", error.message);
    throw error;
  }
};

const editMultipleConversionRate = async (data) => {
  try {
      const { offerIds } = data;
      const conversionRateByOfferId = await getConversionRateByOfferIds(offerIds);
      console.info('All conversionRate retrieved successfully.')
      const result = conversionRateByOfferId.length > 0 
        ? await updateMultipleConversionRate(conversionRateByOfferId)
        : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating conversion rate :", error.message);
    throw error;
  }
};

module.exports = {
  fetchAllBrands,
  fetchBrandByOfferId,
  fetchBrandByKey,
  createBrand,
  editBrand,
  removeBrand,
  editMultipleClicks,
  editMultipleSales,
  editMultipleConversionRate,
};