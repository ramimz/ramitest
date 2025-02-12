const { 
  getAllConversions,
  updateMultipleSeasons,
  getIdProducts,
  updateMultipleIdProduct,
  addConversion,
} = require("../repositories/conversion.repository.js");
const { getSeasonFromTimestamp } = require("../utils/utils.js");

const fetchAllConversions = async (data) => {
    try {
      const { options } = data;
      const result = await getAllConversions(options);
      return result;
    } catch (error) {
      console.error("Error getting all conversions :", error.message);
      throw error;
    }
};

const editMultipleSeason = async (data) => {
  try {
      const seasons = data.map(item => {
        const { key, createdat } = item;
        const season = getSeasonFromTimestamp(Number(createdat));
        return {
          key,
          season
        }
      })
      console.info('All seasons retrieved successfully.', seasons)
      const result = seasons.length > 0
        ? await updateMultipleSeasons(seasons)
        : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating sales :", error.message);
    throw error;
  }
};

const editMultipleIdProduct = async (data) => {
  try {
      const articleIds = data.map(item => item?.articleid);
      const Ids = await getIdProducts(articleIds)
      console.info('All product ids retrieved successfully.')
      const result = Ids.length > 0
        ? await updateMultipleIdProduct(Ids)
        : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating sales :", error.message);
    throw error;
  }
};

const createConversion = async (data) => {
  try {
    const conversion = await addConversion(data);
    return conversion;
  } catch (error) {
    console.error("Error creating a new conversion :", error.message);
    throw error;
  }
};

module.exports = {
  fetchAllConversions,
  editMultipleSeason,
  editMultipleIdProduct,
  createConversion,
};
