const express = require("express");
const { Category } = require("../model/category");
const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await Category.find({});
  if (!categories)
    return res.status(500).json({
      success: false,
      message: "Category Fail",
    });
  res.json({
    success: true,
    result: categories,
  });
});

router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
    image: req.body.image,
  });

  category
    .save()
    .then((result) =>
      res.status(200).json({
        success: true,
        result: result,
      })
    )
    .catch((err) =>
      res.status(400).json({
        success: false,
        message: err,
      })
    );
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    return res.status(404).json({
      success: false,
      message: "The category with the given ID was not found.",
    });
  res.json({
    success: true,
    result: category,
  });
});

router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      color: req.body.color,
      icon: req.body.icon,
      image: req.body.image,
    },
    { new: true }
  );

  if (!category)
    return res.status(400).json({
      success: false,
      message: "The category with the given ID can't update",
    });

  res.json({
    success: true,
    result: category,
  });
});

router.delete("/:id", async (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (!category)
        return res.status(404).json({
          success: false,
          result: category,
        });
      else
        return res.json({
          success: true,
          message: "Category delete success",
        });
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

module.exports = router;
