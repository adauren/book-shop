const express = require("express");
const router = express.Router();

const fs = require("fs");
const formidable = require("formidable");
const _ = require("lodash");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const Product = require("../models/Product");

router.post("/product/create", auth, admin, (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Image could not be upload" }] });
    }

    let product = new Product(fields);

    if (files.photo) {
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    try {
      await product.save();
      res.json(product);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  });
});

module.exports = router;
