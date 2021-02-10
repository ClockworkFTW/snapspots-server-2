const { Router } = require("express");
const router = Router();

const Redis = require("ioredis");
const redis = new Redis();

const foursquare = require("../services/foursquare");
const flickr = require("../services/flickr");
const wikipedia = require("../services/wikipedia");

// Get many
router.get("/", async (req, res) => {
  try {
    const { lat, lng, swLat, swLng, neLat, neLng, type } = req.query;

    // Fetch venues from Foursquare
    let curatedSpots;

    if (lat && lng) {
      curatedSpots = await foursquare.getVenues(
        `ll=${lat},${lng}&radius=100000`
      );
    } else if (swLat && swLng && neLat && neLng) {
      curatedSpots = await foursquare.getVenues(
        `sw=${swLat},${swLng}&ne=${neLat},${neLng}`
      );
    } else if (type === "new") {
      let spots = await req.context.models.Spot.findAll();

      spots = spots.map((spot) => {
        const { geometry, ...rest } = spot.dataValues;

        return {
          ...rest,
          lat: geometry.coordinates[1],
          lng: geometry.coordinates[0],
        };
      });

      return res.status(200).json(spots);
    } else {
      return res.status(400).json("Query parameters not supported");
    }

    // Add photos from Flickr
    curatedSpots = await Promise.all(
      curatedSpots.map(async (spot) => {
        const photos = await flickr.getPhotos(spot.name, {
          lat: spot.lat,
          lng: spot.lng,
        });
        return { ...spot, photos };
      })
    );

    // Filter out spots with less than 5 photos
    curatedSpots = curatedSpots.filter((spot) => spot.photos.length >= 5);

    // Fetch spots from database
    let savedSpots;

    if (lat && lng) {
      savedSpots = await req.context.models.Spot.findByRadius(lng, lat);
    } else {
      savedSpots = await req.context.models.Spot.findByBoundingBox(
        swLng,
        swLat,
        neLng,
        neLat
      );
    }

    const customSpots = savedSpots.filter((spot) => spot.userId);

    curatedSpots = curatedSpots.map((curatedSpot) => {
      const duplicate = savedSpots.find(
        (savedSpot) => savedSpot.fsId === curatedSpot.fsId
      );
      return duplicate ? duplicate : curatedSpot;
    });

    res.status(200).json([...customSpots, ...curatedSpots]);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

// Get spot categories
router.get("/categories", async (req, res) => {
  try {
    const cachedCategories = await redis.get("categories");

    if (cachedCategories) {
      return res.status(200).json(JSON.parse(cachedCategories));
    }

    const categories = await foursquare.getCategories();

    await redis.set("categories", JSON.stringify(categories));

    res.status(200).json(categories);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

// Get one
router.get("/:id", async (req, res) => {
  try {
    const { Spot, Review, User } = req.context.models;

    const { id } = req.params;

    let spot = await Spot.findOne({
      where: { id },
      include: [{ model: Review, include: [{ model: User }] }],
    });

    const { geometry, ...rest } = spot.dataValues;

    spot = {
      ...rest,
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
    };

    res.status(200).json(spot);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    const { Spot, Review, User } = req.context.models;

    // Extract data from request body
    let { lat, lng, description, ...spot } = req.body.spot;

    console.log(req.body.spot);

    // Create a geometric point based on lat/lng
    const point = { type: "Point", coordinates: [lng, lat] };

    // Get extract from Wikipedia if no description was provided
    description = description
      ? description
      : await wikipedia.getExtract(spot.name);

    // Create a new spot
    let newSpot = await Spot.create({
      ...spot,
      description,
      geometry: point,
    });

    // Retrieve created spot from database
    newSpot = await Spot.findOne({
      where: { id: newSpot.id },
      include: [{ model: Review, include: [{ model: User }] }],
    });

    // Format spot geometry back into lat/lng
    const { geometry, ...rest } = newSpot.dataValues;

    newSpot = {
      ...rest,
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
    };

    // Return new spot
    res.status(200).json(newSpot);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const { Spot, Review, User } = req.context.models;

    const { id } = req.params;
    const {
      name,
      description,
      categories,
      equipment,
      photos,
      lat,
      lng,
    } = req.body.spot;

    const point = { type: "Point", coordinates: [lng, lat] };

    await Spot.update(
      { name, description, categories, equipment, photos, geometry: point },
      { where: { id } }
    );

    let updatedSpot = await Spot.findOne({
      where: { id },
      include: [{ model: Review, include: [{ model: User }] }],
    });

    const { geometry, ...rest } = updatedSpot.dataValues;

    updatedSpot = {
      ...rest,
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
    };

    res.status(200).json(updatedSpot);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await req.context.models.Spot.destroy({ where: { id } });

    res.status(200).end();
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

module.exports = router;
