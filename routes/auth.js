const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY;

router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, passwordOne, passwordTwo } = req.body.credentials;

    if (passwordOne !== passwordTwo) {
      return res.status(400).send("passwords do not match");
    }

    const password = await bcrypt.hash(passwordOne, 10);

    const user = { username, email, password };

    const newUser = await req.context.models.User.create(user);

    const payload = {
      id: newUser.dataValues.id,
      username: newUser.dataValues.username,
    };

    const token = jwt.sign(payload, JWT_KEY);

    res.status(200).json({ token });
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body.credentials;

    const user = await req.context.models.User.findOne({ where: { username } });

    const match = user ? await bcrypt.compare(password, user.password) : null;

    if (!match) {
      return res.status(400).json("username or password incorrect");
    }

    const payload = {
      id: user.dataValues.id,
      username: user.dataValues.username,
    };

    const token = jwt.sign(payload, JWT_KEY);

    res.status(200).json({ token });
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

module.exports = router;
