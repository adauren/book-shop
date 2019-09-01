const express = require("express");
const router = express.Router();

const { example } = require("../controllers/user");

router.get("/", example);

module.exports = router;
