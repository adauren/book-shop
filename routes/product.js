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

    if (!products) {
      return res.status(200).json({ msg: "Products not found" });
    }

    return res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/products/related/:id", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;

  try {
    const product = await Product.findById(req.params.id);

    let products = await Product.find({
      _id: { $ne: req.params.id },
      category: product.category
    })
      .limit(limit)
      .populate("category", "_id name");

    if (!products) {
      return res.status(200).json({ msg: "Products not found" });
    }

    return res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/products/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category", {});

    if (!categories) {
      return res.status(200).json({ msg: "Categories not found" });
    }

    return res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/products/search", async (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  try {
    const data = await Product.find(findArgs)
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit);

    if (!data) {
      return res.status(200).json({ msg: "Products not found" });
    }

    res.json({ size: data.length, data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/product/photo/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(400).json({ msg: "Product not found" });
    }

    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.send(product.photo.data);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
