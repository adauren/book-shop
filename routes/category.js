const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Category = require("../models/Category");

router.post("/category/create", auth, admin, async (req, res) => {
  const category = new Category(req.body);
  try {
    await category.save();
    res.json({ category });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
