import mongoose from "mongoose";
import Category from "../models/categoryModels.js";

export const addCategory = async (req, res) => {
  const { name, color, icon } = req.body;
  const category = new Category({ name, color, icon });
  try {
    const savedCategory = await category.save();
    res.status(201).json({ message: "success", data: savedCategory });
    if (!savedCategory) {
      return res.status(400).json({ message: "bad request" });
    }
  } catch (error) {
    res.status(500).json({ message: "fail to fetch category", error: error });
  }
};

export const getCategoryByid = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid id" });
  }

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }
    res.status(200).json({ message: "success", data: category });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch category by id", error: error.message });
  }
};

export const getAllCategory = async (req, res) => {
  try {
    const category = await Category.find();
    if (!category) {
      res.status(404).json({ message: "product not found" });
    }
    res.status(200).json({ message: "success", data: category });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch category", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const deletedData = await Category.findByIdAndDelete(id);
    if (!deletedData) {
      return res.status(404).json({ message: "not found" });
    }
    res.status(200).json({ message: "success", data: [{ id: deletedData.id, category: deletedData.name }] });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch deelete category", error: error.messsage });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const category = await Category.findByIdAndUpdate(id, { name, color, icon }, { new: true });
    if (!category) {
      return res.status(404).json({ message: "bad request" });
    }
    res.status(201).json({ message: "success", data: category });
  } catch (error) {
    res.status(500).json({ message: "fail to fatch update category", error: error });
  }
};

export const getCategoryCount = async (req, res) => {
  const categoryCount = await Category.countDocuments();
  try {
    if (!categoryCount) {
      return res.status(404).json({ message: "no category count", count: 0 });
    }
    res.status(200).json({ message: "success", count: categoryCount });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch count category", error: error.message });
  }
};
