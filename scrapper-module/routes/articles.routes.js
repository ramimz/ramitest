const express = require("express");
const Joi = require("joi");
const router = express.Router();
const JSONbig = require("json-bigint");
const {
    createArticle
} = require("../services/articles.service");
const multer = require("multer");
const upload = multer();

router.post("/", upload.single("file"),async (req, res) => {
    //const body = req.body
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
      const result = await createArticle(fileData);
      res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

module.exports = router;