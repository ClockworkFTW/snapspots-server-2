const { Router } = require("express");
const router = Router();

// Create
router.post("/", async (req, res) => {
  try {
    const { Spot, Review, User } = req.context.models;

    const { review } = req.body;

    await Review.create(review);

    let updatedSpot = await Spot.findOne({
      where: { id: review.spotId },
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

// Update
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const newSpot = await req.context.models.Review.create({
      name: req.body.name,
    });

    res.status(200).json(newSpot);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await req.context.models.Review.destroy({ where: { id } });

    res.status(200).end();
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

module.exports = router;
