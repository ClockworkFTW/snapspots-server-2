const { Router } = require("express");
const router = Router();

// Get one
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await req.context.models.User.findOne({ where: { id } });

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const newSpot = await req.context.models.User.create({
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

    await req.context.models.User.destroy({ where: { id } });

    res.status(200).end();
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error);
  }
});

module.exports = router;
