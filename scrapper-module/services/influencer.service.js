const axios = require('axios');

const {
  getAllInfluencers,
  getInfluencerByUid,
  updateCluster,
  getConversionsByUid,
  updateMultipleGender,
  updateSalesKpiByUid,
  updateUniversInfsThemeKpisByUid,
  addInfluencer,
  updateInfluencer,
  addInfluencerExtraData,
  updateInfluencerExtraData,
  getInfluencerInfos,
} = require("../repositories/influencer.repository.js");

const {
  getGenderFromCivility,
  chunkArray,
} = require("../utils/utils.js");

const env = require("../config/env.js");

const fetchAllInfluencers = async () => {
    try {
      const result = await getAllInfluencers();
      return result.map(res => formatInfluencer(res)).filter(inf => inf.is_deleted === false)
    } catch (error) {
      console.error("Error getting all influencers :", error.message);
      throw error;
    }
};

const formatInfluencer = (data) => {
    const { influence_themes = [], activities = [], favorite_brands_ids = [], univers= [], ...others } = data;
    return {
      ...others,
      univers: [
        ...new Map(univers.map(item => [item.id_categ, item])).values()
      ].filter(item => item.id_categ !== null),
      favorite_brands_ids: [
        ...new Map(favorite_brands_ids.map(item => [item.brand_id, item])).values()
      ].filter(item => item.brand_id !== null),
      influence_themes: [
        ...new Map(influence_themes.map(item => [item.id_categ, item])).values()
      ].filter(item => item.id_categ !== null),
      activities: activities || [],
    }
};

const fetchInfluencerByUid = async (data) => {
    try {
      const result = await getInfluencerByUid(data);
      return formatInfluencer(result);
    } catch (error) {
      console.error("Error fetching an influencer :", error.message);
      throw error;
    }
};

const clusterAll = async (data) => {
  try{
    const { fileData } = data;
    const influencers = fileData?.influencers || [];
    let access = false;

    for (const influencer of influencers) {
      const { uid, cluster } = influencer;
      if(uid === 'nxdlo7mAMzLpyKQp2eM1Wu1GJoq2'){
        access = true;
      }

      if(access){
        await updateCluster({ uid, idCluster: cluster.toString() });
        console.log(`Influencer ${uid} clustered successfully.`);  
      }
    }
    
    return 'All influencers clustered successfully.' 
  }
  catch(error){
    throw error;
  }
};

const fetchConversionsByUid = async (data) => {
  try {
    const { uid } = data;
    const result = await getConversionsByUid(uid);
    return result;
  } catch (error) {
    console.error("Error fetching an influencer conversions :", error.message);
    throw error;
  }
};

const editMultipleGender = async (data) => {
  try {
      const genders = data.map(inf => {
        let gender = 'unknown';
        if(inf.civility) gender = getGenderFromCivility(inf.civility)
        if(gender === 'unknown') gender = inf?.gender || gender;
        return {
          uid: inf.uid,
          gender
        }
      });
      console.info('All genders retrieved successfully.')
      const result = genders.length > 0
        ? await updateMultipleGender(genders)
        : 'No changes detected.'
      return result
  } catch (error) {
    console.error("Error updating clicks :", error.message);
    throw error;
  }
};

const fetchSalesKpiByUid = async (data) => {
  const { uid } = data;
  try {
    const apiUrl = `${env.KPI_API_URL}/sales_kpi/${uid}`;
    const response = await axios.get(apiUrl);
    const result = response.data.map(res => {
      return {
        uid,
        id_categ: res.id_categ,
        id_sub_categ: res.id_sub_categ,
        sales_kpi: res.sales_kpi,
      }
    });
    return result;
  } catch (error) {
    console.error("Error fetching sales kpi :", error.message);
    throw error;
  }
};

const editSalesKpiByUid = async (data) => {
  const { uid } = data;
  try {
    const salesKpiByUid = await fetchSalesKpiByUid({ uid });
    const result = await updateSalesKpiByUid({ salesKpiByUid });
    return result;
  } catch (error) {
    console.error("Error updating sales kpi :", error.message);
    throw error;
  }
};

const fetchUniversInfsThemeKpisByUid = async (data) => {
  const { uid } = data;
  try {
    const apiUrl = `${env.KPI_API_URL}/kpis2/${uid}`;
    const response = await axios.get(apiUrl);
    const result = response.data.map(res => {
      return {
        uid,
        id_categ: res.id_categ,
        id_sub_categ: res.id_sub_categ,
        sales_kpi: res.sales_kpi,
        infs_themes_kpi: res.infs_themes_kpi,
        univers_kpi: res.univers_kpi,
      }
    });
    return result;
  } catch (error) {
    console.error("Error fetching kpi 2:", error.message);
    throw error;
  }
};

const editUniversInfsThemeKpisByUid = async (data) => {
  const { uid } = data;
  try {
    const kpisByUid = await fetchUniversInfsThemeKpisByUid({ uid });
    const result = await updateUniversInfsThemeKpisByUid({ kpisByUid });
    return result;
  } catch (error) {
    console.error("Error updating kpi 2:", error.message);
    throw error;
  }
};

const fetchSalesKpiMultiple = async (data) => {
  try {
    const apiUrl = `${env.KPI_API_URL}/sales_kpi`;
    const response = await axios.post(apiUrl, {
      influencers: data
    });

    const result = response.data;
    const transformedData = Object.entries(result).flatMap(([uid, res]) => 
      res.map(item => ({
        uid,
        id_categ: item.id_categ,
        id_sub_categ: item.id_sub_categ,
        sales_kpi: item.sales_kpi
      }))
    );

    return transformedData;
  } catch (error) {
    console.error("Error fetching sales kpi :", error.message);
    throw error;
  }
};

const fetchUniversInfsThemeKpisMultiple = async (data) => {
  try {
    const apiUrl = `${env.KPI_API_URL}/kpis2`;
    const response = await axios.post(apiUrl, {
      influencers: data
    });

    const result = response.data;
    const transformedData = Object.entries(result).flatMap(([uid, res]) => 
      res.map(item => ({
        uid,
        id_categ: item.id_categ,
        id_sub_categ: item.id_sub_categ,
        univers_kpi: item.univers_kpi,
        infs_themes_kpi: item.infs_themes_kpi,
      }))
    );
    return transformedData;
  } catch (error) {
    console.error("Error fetching kpi 2 :", error.message);
    throw error;
  }
};

const editSalesKpiMultiple = async (data) => {
  try {
    const ids = data.map(item => item.uid)
    const chunks = chunkArray(ids, 10)
    const results = [];
    let i = 0;
    for(const chunk of chunks){
      const chunkResult = await fetchSalesKpiMultiple(chunk)
      await updateSalesKpiByUid({ salesKpiByUid: chunkResult });
      console.log(`chunkResult ${++i} updated successfully.`);
      results.push(...chunkResult);
    }
    
    return results
  } catch (error) {
    console.error("Error updating sales kpis :", error.message);
    throw error;
  }
};

const editUniversInfsThemeKpisMultiple = async (data) => {
  try {
    const ids = data.map(item => item.uid)
    const chunks = chunkArray(ids, 10)
    const results = [];
    let i = 0;
    for(const chunk of chunks){
      const chunkResult = await fetchUniversInfsThemeKpisMultiple(chunk)
      await updateUniversInfsThemeKpisByUid({ kpisByUid: chunkResult });
      console.log(`chunkResult ${++i} updated successfully.`);
      results.push(...chunkResult);
    }
    
    return results
  } catch (error) {
    console.error("Error updating kpis 2:", error.message);
    throw error;
  }
};

const createInfluencer = async (data) => {
  try {
      const influencer = await addInfluencer(data);
      return influencer;
  } catch (error) {
    console.error("Error creating a new influencer :", error.message);
    throw error;
  }
};

const editInfluencer = async (data) => {
  try {
    const influencer = await updateInfluencer(data);
    return influencer;
  } catch (error) {
    console.error("Error editing an influencer :", error.message);
    throw error;
  }
};

const createInfluencerExtraData = async (data) => {
  try {
      const influencer = await addInfluencerExtraData(data);
      return influencer;
  } catch (error) {
    console.error("Error creating a new influencer :", error.message);
    throw error;
  }
};

const editInfluencerExtraData = async (data) => {
  try {
    const influencer = await updateInfluencerExtraData(data);
    return influencer;
  } catch (error) {
    console.error("Error editing an influencer :", error.message);
    throw error;
  }
};

const fetchInfluencerInfos = async (data) => {
  try {
    const result = await getInfluencerInfos(data);
    return result;
  } catch (error) {
    console.error("Error fetching an influencer :", error.message);
    throw error;
  }
};

module.exports = {
  fetchAllInfluencers,
  fetchInfluencerByUid,
  clusterAll,
  fetchConversionsByUid,
  editMultipleGender,
  fetchSalesKpiByUid,
  editSalesKpiByUid,
  editUniversInfsThemeKpisByUid,
  editSalesKpiMultiple,
  editUniversInfsThemeKpisMultiple,
  createInfluencer,
  editInfluencer,
  createInfluencerExtraData,
  editInfluencerExtraData,
  fetchInfluencerInfos,
};