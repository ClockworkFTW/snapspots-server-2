const express = require("express");
const app = express();

require("dotenv").config();
const port = process.env.PORT || 3005;

app.use(express.json());

const cors = require("cors");
app.use(cors());

const { models, sequelize } = require("./models");

app.use((req, res, next) => {
  req.context = { models };
  next();
});

const { authRouter } = require("./routes");
app.use("/auth", authRouter);

const { userRouter } = require("./routes");
app.use("/user", userRouter);

const { spotRouter } = require("./routes");
app.use("/spot", spotRouter);

const { reviewRouter } = require("./routes");
app.use("/review", reviewRouter);

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`SnapSpots running on ${port}!`);
  });
});
