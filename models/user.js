const user = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Spot, { onDelete: "CASCADE" });
    User.hasMany(models.Review, { onDelete: "CASCADE" });
  };

  return User;
};

module.exports = user;
