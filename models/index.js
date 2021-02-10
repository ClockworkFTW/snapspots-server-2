const path = require("path");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: "postgres",
  }
);

const importModel = (model) =>
  require(path.join(__dirname, model))(sequelize, Sequelize.DataTypes);

const models = {
  User: importModel("user"),
  Review: importModel("review"),
  Spot: importModel("spot"),
};

Object.keys(models).forEach((key) => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

module.exports = { models, sequelize };
