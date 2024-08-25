import mongoose from "mongoose";
import Category from "../models/categoryModels.js";
import Product from "../models/productsModels.js";
import multer from "multer";

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const validId = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (validId) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

export const uploadOptions = multer({ storage: storage });

export const addProduct = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "no image in the request" });
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReview: req.body.numReview,
    isFeatured: req.body.isFeatured,
    alamat: req.body.alamat,
  });

  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid Category");
    }
    const savedProduct = await product.save();
    res.status(201).json({ message: "success", data: savedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
};

export const getAllProduct = async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  try {
    const products = await Product.find(filter).select("name image price rating isFeatured alamat").populate("category");
    if (!products) {
      return res.status(400).json({ message: "bad request" });
    }
    res.status(200).json({ message: "success", data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  if (!id) {
    return res.status(400).json({ message: "invalid id" });
  }
  try {
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "fail to fetch get product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "invalid id" });
  }
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    res.status(201).json({ message: "success", data: [{ id: product.id, product: product.name }] });
  } catch (error) {
    res.status(500).json({ message: "fail to delete product", error: error.message });
  }
};

export const editProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        isFeatured: req.body.isFeatured,
        alamat: req.body.alamat,
        numReview: req.body.numReview,
      },
      { new: true }
    );
    if (!product) {
      return res.status(400).json({ message: "wrong id" });
    }
    res.status(201).json({ message: "success", data: product });
  } catch (error) {
    res.status(500).json({ message: "error fetch update product", error: error.message });
  }
};

export const getProductCount = async (req, res) => {
  try {
    const product = await Product.countDocuments();
    if (!product) {
      return res.status(404).json({ message: "no product count", count: 0 });
    }
    res.status(200).json({ message: "success", count: product });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch count product", error: error.message });
  }
};

export const featuredProducts = async (req, res) => {
  const { limit } = req.params;
  try {
    const product = await Product.find({ isFeatured: true }).sort({ dateCreated: -1 }).limit(limit);
    if (!product) {
      return res.status(400).json({ message: "no featured found" });
    }

    res.status(200).json({ message: "success", data: product });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch featured product", error: error.message });
  }
};

export const searchProducts = async (req, res) => {
  const { name } = req.query;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ message: "invalid query parameter/bad request" });
  }

  try {
    const products = await Product.find({
      name: { $regex: new RegExp(name, "i") }, // "i" untuk pencarian yang tidak case-sensitive
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "product not found" });
    }

    res.status(200).send({ message: "success", data: products });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch search products", error: error.message });
  }
};

export const editGalleryImages = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ messsage: "invalid id" });
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(id, { images: imagesPaths }, { new: true });
    if (!product) {
      return res.status(404).json({ message: "no product found" });
    }
    res.status(200).json({ message: "success", images: product });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const editProductImage = async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: "no image in the request" });
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const image = await Product.findByIdAndUpdate(id, { image: `${basePath}${fileName}` }, { new: true });
    if (!image) {
      return res.status(400).json({ message: "wrong id" });
    }
    res.status(201).json({ message: "success", data: image });
  } catch (error) {
    res.status(500).json({ message: "error fetch update product", error: error.message });
  }
};
