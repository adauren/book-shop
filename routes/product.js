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
      if (files.photo.size > 1048576) {
        return res.json({
          errors: [{ msg: "Image should be less than 1MB in size" }]
        });
      }

      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    } else {
      return res.json({
        errors: [{ msg: "Image required" }]
      });
    }

    const { name, description, price, category, quantity } = fields;

    if (!name || !description || !price || !category || !quantity) {
      return res.json({ errors: [{ msg: "All fields required" }] });
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

router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(400).json({ errors: [{ msg: "Product not found" }] });

    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
