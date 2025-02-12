const express = require("express");
const Joi = require("joi");
const router = express.Router();
const JSONbig = require("json-bigint");
const multer = require("multer");
const upload = multer();
const {
  fetchAllInfluencers,
  fetchInfluencerByUid,
  clusterAll,
  fetchConversionsByUid,
  editMultipleGender,
  editSalesKpiByUid,
  editUniversInfsThemeKpisByUid,
  editSalesKpiMultiple,
  editUniversInfsThemeKpisMultiple,
  createInfluencer,
  editInfluencer,
  createInfluencerExtraData,
  editInfluencerExtraData,
} = require("../services/influencer.service.js");

const {
  getAllInfluencersUid,
  getKpiByUid,
} = require("../repositories/influencer.repository.js");

/**
 * @swagger
 * tags:
 *      - name: influencers
 * /i:
 *   get:
 *     summary: Get all influencers
 *     description: This API retrieves the list of all influencers.
 *     tags: [influencers]
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
      const influencers = await fetchAllInfluencers();
      res.status(200).send(JSONbig.stringify({ data: influencers }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name: influencers
 * /i/{uid}:
 *   get:
 *     summary: Get an influencer by uid
 *     description: This API retrieves an influencer details using its unique UID.
 *     tags: [influencers]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The UID of the influencer to fetch.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation.
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
 *                   example: Invalid parameters.
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
router.get("/:uid", async (req, res) => {
    const params = req.params
    try {
      const schema = Joi.object({
        uid: Joi.string().required(),
      });
  
      const { error } = schema.validate(params);
      if (error) {
        res.status(400).send({ message: error.message });
      }
  
      const result = await fetchInfluencerByUid(params.uid);
      res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : influencers
 * /i/update-all-gender:
 *   put:
 *     summary: Update all influencers gender
 *     description: This API updates the gender of all influencers.
 *     tags: [influencers]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message: 
 *                      type: string
 *                      example: All influencers gender are updated successfully.
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
router.put("/update-all-gender", async (req, res) => {
    try {
      const influencers = await getAllInfluencersUid({
        options: {
          gender: true
        }
      });
      console.log('All influencers retrieved successfully.');
      const result = await editMultipleGender(influencers);
      res.status(200).json({ message: result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

router.post("/cluster-multiple", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    // Check if the file is provided and parse it
    if (file) {
      try {
        fileData = JSON.parse(file.buffer.toString()); // Parse JSON content from the uploaded file
      } catch (err) {
        return res
          .status(400)
          .send({ message: "Invalid JSON in uploaded file" });
      }
    } else {
      return res
        .status(400)
        .send({ message: "File 'articles.json' is required" });
    }

    
    const result = await clusterAll({ fileData });
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name: influencers
 * /i/conversions/{uid}:
 *   get:
 *     summary: Get all conversions of an influencer
 *     description: This API retrieves the list of all conversions of an influencer using its UID.
 *     tags: [influencers]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The UID of the influencer to fetch.
 *         schema:
 *           type: string
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
router.get("/conversions/:uid", async (req, res) => {
  const params = req.params
  try {
    const schema = Joi.object({
      uid: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await fetchConversionsByUid(params);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name: influencers
 * /i/kpi/{uid}:
 *   get:
 *     summary: Get all kpis of an influencer
 *     description: This API retrieves the list of all kpis of an influencer using its UID.
 *     tags: [influencers]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The UID of the influencer to fetch.
 *         schema:
 *           type: string
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
router.get("/kpi/:uid", async (req, res) => {
  const params = req.params
  try {
    const schema = Joi.object({
      uid: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await getKpiByUid(params);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name: influencers
 * /i/sales-kpi/{uid}:
 *   put:
 *     summary: Update sales kpi of an influencer
 *     description: This API updates sales kpi of an influencer using its UID.
 *     tags: [influencers]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The UID of the influencer to fetch.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example : Influencer sales kpi updated successfully.
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
router.put("/sales-kpi/:uid", async (req, res) => {
  const params = req.params
  try {
    const schema = Joi.object({
      uid: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }
  
    const result = await editSalesKpiByUid(params);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name: influencers
 * /i/univers-infs-themes-kpi/{uid}:
 *   put:
 *     summary: Update universe and influence themes kpis of an influencer
 *     description: This API updates universe and influence themes kpis of an influencer using its UID.
 *     tags: [influencers]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The UID of the influencer to fetch.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example : Influencer universe and influence themes kpis updated successfully.
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
router.put("/univers-infs-themes-kpi/:uid", async (req, res) => {
  const params = req.params
  try {
    const schema = Joi.object({
      uid: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }
  
    const result = await editUniversInfsThemeKpisByUid(params);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : influencers
 * /i/update-all-sales-kpi:
 *   put:
 *     summary: Update all influencers sales kpis
 *     description: This API updates the sales kpis of all influencers.
 *     tags: [influencers]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message: 
 *                      type: string
 *                      example: All influencers sales kpis are updated successfully.
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
router.put("/update-all-sales-kpi", async (req, res) => {
  try {
    const influencers = await getAllInfluencersUid({});
    console.log('All influencers retrieved successfully.');
    const result = await editSalesKpiMultiple(influencers);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : influencers
 * /i/update-all-second-kpi:
 *   put:
 *     summary: Update all influencers influence themes and universe kpis
 *     description: This API updates the influence themes and universe kpis of all influencers.
 *     tags: [influencers]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message: 
 *                      type: string
 *                      example: All influencers universe and influence themes kpis are updated successfully.
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
router.put("/update-all-second-kpi", async (req, res) => {
  try {
    const influencers = await getAllInfluencersUid({});
    console.log('All influencers retrieved successfully.');
    const result = await editUniversInfsThemeKpisMultiple(influencers);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: influencers
 * /i:
 *   post:
 *     summary: Create a new influencer
 *     description: This API creates a new influencer.
 *     tags: [influencers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Unique identifier for the influencer.
 *                 example: "influencer_12345"
 *               banner:
 *                 type: string
 *                 description: URL of the influencer's banner image.
 *                 example: "https://example.com/banner.jpg"
 *               civility:
 *                 type: string
 *                 description: Influencer's civility (e.g., Mr, Ms).
 *                 example: "Ms"
 *               community_size:
 *                 type: object
 *                 description: Object containing details about the influencer's community size.
 *                 example: { "instagram": 50000, "youtube": 120000 }
 *               country:
 *                 type: string
 *                 description: Country of the influencer.
 *                 example: "FR"
 *               description:
 *                 type: string
 *                 description: Bio or description of the influencer.
 *                 example: "Fashion and beauty content creator."
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Influencer's email address.
 *                 example: "influencer@example.com"
 *               first_name:
 *                 type: string
 *                 description: First name of the influencer.
 *                 example: "Emma"
 *               last_name:
 *                 type: string
 *                 description: Last name of the influencer.
 *                 example: "Dupont"
 *               name:
 *                 type: string
 *                 description: Display name of the influencer.
 *                 example: "Emma Dupont"
 *               language:
 *                 type: string
 *                 description: Preferred language of the influencer.
 *                 example: "fr"
 *               private:
 *                 type: boolean
 *                 description: Indicates if the profile is private.
 *                 example: false
 *               score:
 *                 type: number
 *                 description: Influence score.
 *                 example: 85
 *               univers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The influencer's main niche or universe.
 *                 example: ["Fashion", "FOOD"]
 *               favorite_brands_ids:
 *                 type: object
 *                 description: List of favorite brand IDs.
 *                 example: {"brand_001": true, "brand_002": true}
 *               is_deleted:
 *                 type: boolean
 *                 description: Indicates if the influencer profile is deleted.
 *                 example: false
 *     responses:
 *       200:
 *         description: Influencer successfully created.
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
router.post("/", async (req, res) => {
  const body = req.body
  try {
    const result = await createInfluencer(body);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: influencers
 * /i/{uid}:
 *   patch:
 *     summary: Update an influencer's details
 *     description: This API allows you to update the details of an existing influencer using their unique ID.
 *     tags: [influencers]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The unique identifier for the influencer to update.
 *         schema:
 *           type: string
 *         example: "influencer_12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 description: URL of the influencer's banner image.
 *                 example: "https://example.com/banner.jpg"
 *               civility:
 *                 type: string
 *                 description: Influencer's civility (e.g., Mr, Ms).
 *                 example: "Ms"
 *               community_size:
 *                 type: object
 *                 description: Object containing details about the influencer's community size.
 *                 example: { "instagram": 50000, "youtube": 120000 }
 *               country:
 *                 type: string
 *                 description: Country of the influencer.
 *                 example: "FR"
 *               description:
 *                 type: string
 *                 description: Bio or description of the influencer.
 *                 example: "Fashion and beauty content creator."
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Influencer's email address.
 *                 example: "influencer@example.com"
 *               first_name:
 *                 type: string
 *                 description: First name of the influencer.
 *                 example: "Emma"
 *               last_name:
 *                 type: string
 *                 description: Last name of the influencer.
 *                 example: "Dupont"
 *               name:
 *                 type: string
 *                 description: Display name of the influencer.
 *                 example: "Emma Dupont"
 *               language:
 *                 type: string
 *                 description: Preferred language of the influencer.
 *                 example: "fr"
 *               private:
 *                 type: boolean
 *                 description: Indicates if the profile is private.
 *                 example: false
 *               score:
 *                 type: number
 *                 description: Influence score.
 *                 example: 85
 *               univers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The influencer's main niche or universe.
 *                 example: ["Fashion", "FOOD"]
 *               favorite_brands_ids:
 *                 type: object
 *                 description: List of favorite brand IDs.
 *                 example: {"brand_001": true, "brand_002": true}
 *               is_deleted:
 *                 type: boolean
 *                 description: Indicates if the influencer profile is deleted.
 *                 example: false
 *     responses:
 *       200:
 *         description: Influencer successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request, invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid parameters."
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
router.patch("/:uid", async (req, res) => {
  const params = req.params
  const body = req.body
  try {
    const schema = Joi.object({
      uid: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await editInfluencer({ ...params, updates: body });
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: influencers
 * /i/extra:
 *   post:
 *     summary: Create extra data for an influencer
 *     description: This API allows you to add extra data related to an influencer, such as gender, influence themes, and activities.
 *     tags: [influencers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: Unique identifier for the influencer.
 *                 example: "influencer_12345"
 *               gender:
 *                 type: string
 *                 description: Gender of the influencer.
 *                 example: "female"
 *               influence_themes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of themes related to the influencer's influence (e.g., Fashion, Fitness, etc.).
 *                 example: ["Fashion", "Lifestyle"]
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of activities that the influencer participates in (e.g., blogging, public speaking).
 *                 example: ["blogging", "public speaking"]
 *     responses:
 *       200:
 *         description: Influencer extra data successfully created.
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
router.post("/extra", async (req, res) => {
  const body = req.body
  try {
    const result = await createInfluencerExtraData(body);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: influencers
 * /i/extra/{uid}:
 *   patch:
 *     summary: Update extra data for an influencer
 *     description: This API allows you to update the extra data (gender, influence themes, activities) for an influencer.
 *     tags: [influencers]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: Unique identifier of the influencer to update.
 *         schema:
 *           type: string
 *           example: "influencer_12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gender:
 *                 type: string
 *                 description: Gender of the influencer.
 *                 example: "male"
 *               influence_themes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of themes related to the influencer's influence.
 *                 example: ["Fashion", "Technology"]
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of activities that the influencer participates in.
 *                 example: ["blogging", "vlogging"]
 *     responses:
 *       200:
 *         description: Influencer extra data successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request. Invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid uid."
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
router.patch("/extra/:uid", async (req, res) => {
  const params = req.params
  const body = req.body
  try {
    const schema = Joi.object({
      uid: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await editInfluencerExtraData({ ...params, updates: body });
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;