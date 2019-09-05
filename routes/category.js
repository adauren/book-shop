const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Category = require("../models/Category");

router.post(
  "/category/create",
  [
    check("name", "Category name is required")
      .not()
      .isEmpty()
  ],
  auth,
  admin,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, date } = req.body;

    try {
      // check category existing
      let category = await Category.findOne({ name });

      if (category) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Category already exists" }] });
      }

      category = new Category({ name, date });

      await category.save();

      return res.json(category);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/category/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.json({
        errors: [{ msg: "Category not found" }]
      });
    }

    return res.status(400).json(category);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.put("/category/:id", auth, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    category.name = req.body.name;

    await category.save();

    return res.status(400).json(category);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/category/:id", auth, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    await category.remove();

    res.json({ msg: "Category deleted" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.json({
        errors: [{ msg: "Category not found" }]
      });
    }
    res.status(500).send("Server Error");
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();

    if (!categories) {
      return res.json({
        errors: [{ msg: "There is no category" }]
      });
    }

    return res.status(400).json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
