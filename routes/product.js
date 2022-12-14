const express = require("express");
const mongoose = require("mongoose");
const { Category } = require("../model/category");
const router = express.Router();
const { Product } = require("../model/product");
const { UploadOption, GetFilePath } = require("../utils/image-upload");

router.get("/", async (req, res) => {
  let filter = {};

  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const products = await Product.find(filter).populate("category");

  if (!products) {
    return res.status(500).json({
      success: false,
      message: "Fetch product fail",
    });
  }

  res.json({ success: true, result: products });
});

router.post("/", UploadOption.array("images"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  
  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  const images = [];

  if (!req.files) {
    return res
      .status(400)
      .json({ success: false, message: "File upload was invalid" });
  }

  req.files.map((file) => {
    images.push(GetFilePath(file));
  });

  const model = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: images[0],
    brand: req.body.brand,
    price: req.body.price,
    images: images,
    category: req.body.category,
    countInStock: req.body.countInStock,
    isFeatured: req.body.isFeatured,
  });

  const product = await model.save();

  if (!product) {
    return res.status(400).json({
      success: false,
      message: "The input give was invalid",
    });
  }

  res.json({
    success: true,
    result: product,
  });
});

router.patch(
  "/upload-gallery/:id",
  UploadOption.array("images"),
  async (req, res) => {
    const imagePaths = [];
    if (!req.files) {
      return res
        .status(400)
        .json({ success: false, message: "File upload was invalid" });
    }

    req.files.map((file) => {
      imagePaths.push(GetFilePath(file));
    });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { images: imagePaths },
      { new: true }
    );

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product upload gallery is failed" });
    }

    res.json({ success: true, result: product });
  }
);

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot count product" });
  }
  res.json({ success: true, result: { count: productCount } });
});

router.get("/get/featured/:count?", async (req, res) => {
  const count = req.params.count ? req.params.count : 5;
  const products = await Product.find({ isFeatured: true }).limit(count);

  if (!products) {
    return res
      .status(500)
      .json({ success: false, message: "Get product feature was fail" });
  }

  res.json({ success: true, result: products });
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "The product that give by the ID was not found",
    });
  }

  res.json({
    success: true,
    result: product,
  });
});

router.put("/:id", UploadOption.array("images"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  const product = await Product.findById(req.params.id);

  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  if (req.files) {
    newImagePath = req.files.map((file) => GetFilePath(file));
  } else {
    newImagePath = product.images;
  }

  const productUpdate = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: newImagePath[0],
      images: newImagePath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  );

  if (!productUpdate) {
    return res.status(404).json({
      success: false,
      message: "The product that given by the ID was not found",
    });
  }

  res.json({
    success: true,
    result: productUpdate,
  });
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "The product that given by the ID was not found",
        });
      } else {
        return res.json({
          success: true,
          message: "Remove product is successfully",
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        success: false,
        error: err,
      })
    );
});

module.exports = router;
