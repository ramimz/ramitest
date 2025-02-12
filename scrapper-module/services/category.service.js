const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllSubCategories,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  addCategorySmi,
  updateCategorySmi,
} = require("../repositories/category.repository.js");

const fetchAllCategories = async () => {
    try {
      const result = await getAllCategories();
      return result;
    } catch (error) {
      console.error("Error getting all categories :", error.message);
      throw error;
    }
};

const createCategory= async (data) => {
    try {
      const { categoryName } = data;
      const result = await addCategory(categoryName);
      return result;
    } catch (error) {
      console.error("Error adding category :", error.message);
      throw error;
    }
};

const editCategory= async (data) => {
  try {
    const { idCateg, categoryName, idCategSmi } = data;
    const result = await updateCategory(idCateg, categoryName, idCategSmi);
    return result;
  } catch (error) {
    console.error("Error editing category :", error.message);
    throw error;
  }
};

const removeCategory= async (data) => {
  try {
    const { idCateg } = data;
    const result = await deleteCategory(idCateg);
    return result;
  } catch (error) {
    console.error("Error removing category :", error.message);
    throw error;
  }
};

const fetchAllSubCategories = async () => {
  try {
    const result = await getAllSubCategories();
    return result;
  } catch (error) {
    console.error("Error getting all subcategories :", error.message);
    throw error;
  }
};

const createSubCategory= async (data) => {
  try {
    const { subCategName, idCateg } = data;
    const result = await addSubCategory(subCategName, idCateg);
    return result;
  } catch (error) {
    console.error("Error adding subcategory :", error.message);
    throw error;
  }
};

const editSubCategory= async (data) => {
  try {
    const { idSubCateg, subCategName, idCateg } = data;
    const result = await updateSubCategory(idSubCateg, subCategName, idCateg);
    return result;
  } catch (error) {
    console.error("Error editing subcategory :", error.message);
    throw error;
  }
};

const removeSubCategory= async (data) => {
  try {
    const { idSubCateg } = data;
    const result = await deleteSubCategory(idSubCateg);
    return result;
  } catch (error) {
    console.error("Error removing subcategory :", error.message);
    throw error;
  }
};

const createCategorySmi= async (data) => {
  try {
    const result = await addCategorySmi(data);
    return result;
  } catch (error) {
    console.error("Error adding category smi :", error.message);
    throw error;
  }
};

const editCategorySmi= async (data) => {
  try {
    const result = await updateCategorySmi(data);
    return result;
  } catch (error) {
    console.error("Error editing category smi :", error.message);
    throw error;
  }
};

module.exports = {
  fetchAllCategories,
  createCategory,
  editCategory,
  removeCategory,
  fetchAllSubCategories,
  createSubCategory,
  editSubCategory,
  removeSubCategory,
  createCategorySmi,
  editCategorySmi,
};