const review = (sequelize, DataTypes) => {
  const Review = sequelize.define("review", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    visitedOn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User);
    Review.belongsTo(models.Spot);
  };

  return Review;
};

module.exports = review;
