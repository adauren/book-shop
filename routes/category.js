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

      res.json(category);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
