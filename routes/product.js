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

    product.photo = undefined;
    if (!product)
      return res.status(400).json({ errors: [{ msg: "Product not found" }] });

    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/product/:id", auth, admin, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    console.log(product);
    if (!product)
      return res.status(400).json({ errors: [{ msg: "Product not found" }] });

    await product.remove();
    return res.status(200).json({ msg: "Product deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.put("/product/:id", auth, admin, (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Image could not be upload" }] });
    }

    let product = await Product.findById(req.params.id);
    product = _.extend(product, fields, files);

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

    res.json(product);
  });
});

router.get("/products", async (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  try {
    const products = await Product.find()
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .limit(limit);

    return res.json({ products });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
