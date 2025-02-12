const { PrismaClient, Prisma } = require("@prisma/client");
const { handlePrismaError } = require("../utils/utils");

const db = new PrismaClient();

const getCategorySmiByKey = async (data) => {
  const { categorySmiKey } = data;
  const categorySmi = await db.categorySmi.findUnique({
    select: {
      key: true,
      text_fr: true,
    },
    where: {
      key: categorySmiKey
    }
  })

  return categorySmi;
};

const getCategoryByInfsTheme = async (data) => {
  try{
    const { influence_themes } = data;
    const result = await db.$queryRaw(
            Prisma.sql`
              SELECT inf.influence_themes, 
              c.id_categ, c.category_name
              FROM infs_theme_categ inf
              LEFT JOIN category c ON c.id_categ = ANY(inf.id_categ)
              WHERE i.influence_themes IN (${Prisma.join(influence_themes)})
              GROUP BY i.key, c.id_categ;
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

const getAllCategories = async () => {
  try{
    const categories = await db.$queryRaw`
      SELECT 
        c.id_categ,
        c.category_name,
        array_agg(json_build_object('key', cs.key, 'categ_smi_name', cs.text_fr)) AS categ_smi
      FROM category c
      LEFT JOIN category_smi cs ON cs.key = ANY(c.id_categ_smi)
      GROUP BY c.id_categ
    `;

    return categories;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addCategory = async (categoryName) => {
  try {
    const existingCategory = await db.category.findFirst({
      where: {
        categoryName: categoryName
      }
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const newCategory = await db.category.create({
      data: {
        categoryName: categoryName,
      }
    });
    return newCategory;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateCategory = async (idCateg, categoryName, idCategSmi) => {
  try {
    const existingCategory = await db.category.findUnique({
      where: { idCateg },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    if (categoryName && categoryName !== existingCategory.categoryName) {
      const categoryWithSameName = await db.category.findFirst({
        where: { categoryName },
      });

      if (categoryWithSameName) {
        throw new Error("Category with this name already exists");
      }
    }

    const updatedCategory = await db.category.update({
      where: { idCateg },
      data: {
        categoryName: categoryName || existingCategory.categoryName,
        idCategSmi: idCategSmi || existingCategory.idCategSmi
      },
    });

    return updatedCategory;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const deleteCategory = async (idCateg) => {
  try {
    const existingCategory = await db.category.findUnique({
      where: { idCateg },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    await db.category.delete({
      where: { idCateg },
    });

    return "Category deleted successfully";
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const getAllSubCategories = async () => {
  try{
    const subcategories = await db.$queryRaw`
      SELECT 
        sub.id_sub_categ,
        sub.sub_categ_name,
        array_agg(json_build_object('id_categ', c.id_categ, 'category_name', c.category_name)) AS categ
      FROM subcategory sub
      LEFT JOIN category c ON c.id_categ = ANY(sub.id_categ)
      GROUP BY sub.id_sub_categ
    `;

    return subcategories;
  }
  catch(error){
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addSubCategory = async (subCategName, idCateg) => {
  try {
    const existingSubCategory = await db.subCategory.findFirst({
      where: {
        subCategName: subCategName
      }
    });

    if (existingSubCategory) {
      throw new Error("Subcategory with this name already exists");
    }

    const newSubCategory = await db.subCategory.create({
      data: {
        subCategName,
        idCateg,
      }
    });
    return newSubCategory;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateSubCategory = async (idSubCateg, subCategName, idCateg) => {
  try {
    const existingSubCategory = await db.subCategory.findUnique({
      where: { idSubCateg },
    });

    if (!existingSubCategory) {
      throw new Error("Subcategory not found");
    }

    if (subCategName && subCategName !== existingSubCategory.subCategName) {
      const subCategoryWithSameName = await db.subCategory.findFirst({
        where: { subCategName },
      });

      if (subCategoryWithSameName) {
        throw new Error("Subcategory with this name already exists");
      }
    }

    const updatedSubCategory = await db.subCategory.update({
      where: { idSubCateg },
      data: {
        subCategName: subCategName || existingSubCategory.subCategName,
        idCateg: idCateg || existingSubCategory.idCateg,
      },
    });

    return updatedSubCategory;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const deleteSubCategory = async (idSubCateg) => {
  try {
    const existingSubCategory = await db.subCategory.findUnique({
      where: { idSubCateg },
    });

    if (!existingSubCategory) {
      throw new Error("Subcategory not found");
    }

    await db.subCategory.delete({
      where: { idSubCateg },
    });

    return "Subategory deleted successfully";
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const addCategorySmi = async (data) => {
  try {
    const {
      key, 
      img,
      text_en, 
      text_es, 
      text_fr, 
      text_pl
    } = data;

    const categData = {
      key, 
      img,
      text_en, 
      text_es, 
      text_fr, 
      text_pl
    };

    const columns = Object.keys(categData).join(", ");
    const values = Object.values(categData).map(value => {
      return `'${value}'`;
    }).join(", ");

    await db.$executeRawUnsafe(`
      INSERT INTO category_smi (${columns})
      VALUES (${values})
      RETURNING *;
    `);

    return 'Category SMI added successfully.';
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

const updateCategorySmi = async (data) => {
  try {
    const { key, updates } = data;
    const updatedCateg = await db.categorySmi.update({
      where: {
        key,
      },
      data: updates
    });

    return updatedCateg;
  } catch (error) {
    const errorMessage = handlePrismaError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

module.exports = {
  getCategorySmiByKey,
  getCategoryByInfsTheme,
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
};