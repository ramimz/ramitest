const express = require("express");
const Joi = require("joi");
const router = express.Router();

const {
  fetchAllSubCategories,
  createSubCategory,
  editSubCategory,
  removeSubCategory,
} = require("../services/category.service.js");

/**
 * @swagger
 * tags:
 *      - name: subcategories
 * /sub:
 *   get:
 *     summary: Get all subcategories
 *     description: This API retrieves the list of all subcategories.
 *     tags: [subcategories]
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
      const subcategories = await fetchAllSubCategories();
      res.status(200).json({ data: subcategories });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * /sub:
 *   post:
 *     summary: Create a new subcategory
 *     description: This API creates a new subcategory with a given name and associate it to a category.
 *     tags: [subcategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subCategName
 *             properties:
 *               subCategName:
 *                 type: string
 *                 example: "pantalon"
 *               idCateg:
 *                 type: array
 *                 example: ["cm67sy6nm0006uz4sqg6ay144"]
 *     responses:
 *       200:
 *         description: Subcategory successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: 
 *                     idSubCateg: "cm67sy69x0000uz4s9lhhvm03"
 *                     subCategName: "pantalon"
 *                     idCateg: ["cm67sy6nm0006uz4sqg6ay144"]
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "\"subCategName\" is required"
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
            subCategName: Joi.string().required(),
            idCateg: Joi.array().items(Joi.string().required()).unique().min(1),
        });
      
        const { error } = schema.validate(body);
        if (error) {
            res.status(400).send({ message: error.message });
        }
        const result = await createSubCategory(body);
        res.status(200).json({ data: result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * /sub/{idSubCateg}:
 *   put:
 *     summary: Update a subcategory
 *     description: This API updates the subcategory name or the idCateg list.
 *     tags: [subcategories]
 *     parameters:
 *       - in: path
 *         name: idSubCateg
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subcategory to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subCategName:
 *                 type: string
 *                 example: "new subcategory name"
 *               idCateg:
 *                 type: array
 *                 example: [ "cm67sy7lh000euz4sfr31dw86" ]
 *     responses:
 *       200:
 *         description: Subcategory successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: 
 *                     idSubCateg: "cm67sy69x0000uz4s9lhhvm03"
 *                     subCategName: "new subcategory name"
 *                     idCateg: [ "cm67sy7lh000euz4sfr31dw86" ]
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid subcategory ID"
 *       404:
 *         description: Subcategory not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subcategory not found"
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
router.put("/:idSubCateg", async (req, res) => {
  const body = req.body
  const params = req.params
  try {
      const schema = Joi.object({
        idSubCateg:  Joi.string().required(),
        subCategName: Joi.string().optional().allow('', null),
        idCateg: Joi.array().items(Joi.string().required()).unique().min(1).optional(),
      });
    
      const { error } = schema.validate({ ...body, ...params });
      if (error) {
          res.status(400).send({ message: error.message });
      }
      const result = await editSubCategory({ ...body, ...params });
      res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /sub/{idSubCateg}:
 *   delete:
 *     summary: Delete a subcategory
 *     description: This API deletes a subcategory by its ID.
 *     tags: [subcategories]
 *     parameters:
 *       - in: path
 *         name: idSubCateg
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subcategory to delete.
 *     responses:
 *       200:
 *         description: Subcategory successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subcategory deleted successfully"
 *       404:
 *         description: Subcategory not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subcategory not found"
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
router.delete("/:idSubCateg", async (req, res) => {
  const params = req.params
  try {
      const schema = Joi.object({
        idSubCateg:  Joi.string().required(),
      });
    
      const { error } = schema.validate(params);
      if (error) {
        res.status(400).send({ message: error.message });
      }
      const result = await removeSubCategory(params);
      res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;