const spot = (sequelize, DataTypes) => {
  const Spot = sequelize.define("spot", {
    fsId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    equipment: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    geometry: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  Spot.associate = (models) => {
    Spot.belongsTo(models.User);
    Spot.hasMany(models.Review, { onDelete: "CASCADE" });
  };

  Spot.findByRadius = async (lng, lat) => {
    let spots = await Spot.findAll({
      where: sequelize.where(
        sequelize.fn(
          "ST_DWithin",
          sequelize.col("geometry"),
          sequelize.fn(
            "ST_SetSRID",
            sequelize.fn("ST_MakePoint", lng, lat),
            4326
          ),
          0.1
        ),
        true
      ),
    });

    return formatCoordinates(spots);
  };

  Spot.findByBoundingBox = async (sw_lng, sw_lat, ne_lng, ne_lat) => {
    let spots = await Spot.findAll({
      where: sequelize.where(
        sequelize.fn(
          "ST_Within",
          sequelize.col("geometry"),
          sequelize.fn("ST_MakeEnvelope", sw_lng, sw_lat, ne_lng, ne_lat, 4326)
        ),
        true
      ),
    });

    return formatCoordinates(spots);
  };

  return Spot;
};

const formatCoordinates = (spots) =>
  spots.map((spot) => {
    const { geometry, ...rest } = spot.dataValues;
    return {
      ...rest,
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
    };
  });

module.exports = spot;
