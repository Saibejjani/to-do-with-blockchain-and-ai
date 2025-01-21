const express = require("express");
const User = require("../models/users");
const {
  checkForAuthenticationCookie,
} = require("../middlewares/authentication");

const router = express.Router();

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await User.matchPasswordAndGenrateToken(email, password);
    res.cookie("token", token, {
      httpOnly: false,
    });
    return res.json({ message: "logged in successfully" });
  } catch (error) {
    return res.status(401).json({
      error: "incorrect password or email.",
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    console.log(req?.body);
    const { fullName, email, password } = req.body;
    if (!fullName && !email && !password) {
      res.status(418).json({ message: "not enough information" });
    }

    const result = await User.create({ fullName, email, password });
    console.log(result);

    res.json("successfully registered");
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/signout", async (req, res) => {
  res.clearCookie("token");
});

router.get("/verify", checkForAuthenticationCookie("token"), (req, res) => {
  res.status(200).json({ message: "token is verified", user: req?.user });
});

module.exports = router;
