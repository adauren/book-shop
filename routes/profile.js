const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");

router.get("/profile/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/profile/:id", auth, admin, async (req, res) => {
  try {
    const profile = await User.findById(req.params.id).select("-password");

    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    let profile = await User.findById(req.user.id);

    if (!profile) {
      return res.json({ msg: "Profile not found" });
    }

    profile = await User.findOneAndUpdate(
      { _id: profile._id },
      { $set: req.body },
      { $new: true }
    ).select("-password");

    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
