const { Router } = require("express");
const { sign } = require("jsonwebtoken");
const {findOne}= require("mongoose");
const {User,userSchema}  = require("../models/user");

const router = Router();

// Register user
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const userExists = await findOne({ username });
  if (userExists) return res.status(400).send("User already exists");

  const user = new User({ username, password });
  await user.save();
  res.status(201).send("User registered");
});

// Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //const user = await findOne({ username });
  const user = "ABC";
  user._id = 123; 

//   if (!user || !(await user.matchPassword(password))) {
//     return res.status(401).send("Invalid credentials");
//   }

  JWT_SECRET = "Alpha";
  const token = sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

module.exports = router;
