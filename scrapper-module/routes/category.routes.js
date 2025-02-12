const express = require("express");
const Joi = require("joi");
const router = express.Router();

const {
  fetchAllCategories,
  createCategory,
  editCategory,
  removeCategory,
  createCategorySmi,
  editCategorySmi,
} = require("../services/category.service.js");

/**
 * @swagger
 * tags:
 *      - name: categories
 * /cat:
 *   get:
 *     summary: Get all categories
 *     description: This API retrieves the list of all categories.
 *     tags: [categories]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   example : []
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/", async (req, res) => {
    try {
      const categories = await fetchAllCategories();
      res.status(200).json({ data: categories });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * /cat:
 *   post:
 *     summary: Create a new category
 *     description: This API creates a new category with a given name.
 *     tags: [categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "accessoire"
 *     responses:
 *       200:
 *         description: Category successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: 
 *                     idCateg: "cm67sy69x0000uz4s9lhhvm03"
 *                     categoryName: "accessoire"
 *                     idCategSmi: null
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "\"categoryName\" is required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/", async (req, res) => {
    const body = req.body
    try {
        const schema = Joi.object({
            categoryName: Joi.string().required(),
        });
      
        const { error } = schema.validate(body);
        if (error) {
            res.status(400).send({ message: error.message });
        }
        const result = await createCategory(body);
        res.status(200).json({ data: result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * /cat/{idCateg}:
 *   put:
 *     summary: Update a category
 *     description: This API updates the category name or the idCategSmi list.
 *     tags: [categories]
 *     parameters:
 *       - in: path
 *         name: idCateg
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "new category name"
 *               idCategSmi:
 *                 type: string
 *                 example: [ "-MkDF5C53fiZ6P_pC57x" ]
 *     responses:
 *       200:
 *         description: Category successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: 
 *                     idCateg: "cm67sy69x0000uz4s9lhhvm03"
 *                     categoryName: "new category name"
 *                     idCategSmi: ["-MVVjqArILS7OyGutYuC", "-MkDF5C53fiZ6P_pC57x"]
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid category ID"
 *       404:
 *         description: Category not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/:idCateg", async (req, res) => {
  const body = req.body
  const params = req.params
  try {
      const schema = Joi.object({
        idCateg:  Joi.string().required(),
        categoryName: Joi.string().optional().allow('', null),
        idCategSmi: Joi.array().items(Joi.string().required()).min(1).unique().optional(),
      });
    
      const { error } = schema.validate({ ...body, ...params });
      if (error) {
          res.status(400).send({ message: error.message });
      }
      const result = await editCategory({ ...body, ...params });
      res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /cat/{idCateg}:
 *   delete:
 *     summary: Delete a category
 *     description: This API deletes a category by its ID.
 *     tags: [categories]
 *     parameters:
 *       - in: path
 *         name: idCateg
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to delete.
 *     responses:
 *       200:
 *         description: Category successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       404:
 *         description: Category not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:idCateg", async (req, res) => {
  const params = req.params
  try {
      const schema = Joi.object({
        idCateg:  Joi.string().required(),
      });
    
      const { error } = schema.validate(params);
      if (error) {
        res.status(400).send({ message: error.message });
      }
      const result = await removeCategory(params);
      res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: categories
 * /cat/smi:
 *   post:
 *     summary: Create a new SMI category
 *     description: This API creates a new category in the SMI system.
 *     tags: [categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: The unique identifier of the category.
 *                 example: "F123"
 *               img:
 *                 type: string
 *                 description: URL of the category image.
 *                 example: "https://example.com/image.jpg"
 *               text_en:
 *                 type: string
 *                 description: Category name in English.
 *                 example: "Fashion"
 *               text_es:
 *                 type: string
 *                 description: Category name in Spanish.
 *                 example: "Moda"
 *               text_fr:
 *                 type: string
 *                 description: Category name in French.
 *                 example: "Mode"
 *               text_pl:
 *                 type: string
 *                 description: Category name in Polish.
 *                 example: "Moda"
 *     responses:
 *       200:
 *         description: Category successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/smi", async (req, res) => {
  const body = req.body
  try {
      const result = await createCategorySmi(body);
      res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: categories
 * /cat/smi/{key}:
 *   patch:
 *     summary: Update an SMI category
 *     description: This API updates an existing category in the SMI system using its unique key.
 *     tags: [categories]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The unique identifier of the category to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *                 description: URL of the category image.
 *                 example: "https://example.com/image.jpg"
 *               text_en:
 *                 type: string
 *                 description: Updated category name in English.
 *                 example: "Fashion"
 *               text_es:
 *                 type: string
 *                 description: Updated category name in Spanish.
 *                 example: "Moda"
 *               text_fr:
 *                 type: string
 *                 description: Updated category name in French.
 *                 example: "Mode"
 *               text_pl:
 *                 type: string
 *                 description: Updated category name in Polish.
 *                 example: "Moda"
 *     responses:
 *       200:
 *         description: Category successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid key provided."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.patch("/smi/:key", async (req, res) => {
  const params = req.params
  const body = req.body
  try {
      const result = await editCategorySmi({ ...params, updates: body });
      res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;