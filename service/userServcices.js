import mongoose from "mongoose";
import User from "../models/userModels.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userList = async (req, res) => {
  try {
    const users = await User.find().select("username email");
    if (!users) {
      return res.status(404).json({ message: "no user found" });
    }
    res.status(200).json({ message: "success", data: users });
  } catch (err) {
    res.status(500).json({ message: "fail to fetch users", error: err.message });
  }
};

export const userRegister = async (req, res) => {
  const { username, email, password, phone, isAdmin, alamat } = req.body;

  // Validasi password kosong
  if (password === "") {
    return res.status(400).json({ message: "Password tidak boleh kosong" });
  }

  try {
    // Cek apakah username sudah ada di database
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // Cek apakah email sudah ada di database
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "No HP sudah terdaftar" });
    }

    // Hash password sebelum menyimpan pengguna baru
    const passwordHash = bcrypt.hashSync(password, 10);

    // Membuat instance User baru
    const users = new User({
      username,
      email,
      passwordHash,
      phone,
      isAdmin,
      alamat,
    });

    // Menyimpan pengguna baru
    const savedUser = await users.save();
    if (!savedUser) {
      return res.status(404).json({ message: "Cannot add user" });
    }

    // Jika berhasil, kirim respon sukses
    res.status(201).json({ message: "Success", data: savedUser });
  } catch (error) {
    res.status(500).json({ message: "Fail to add user", error: error.message });
  }
};

export const userDetail = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid id" });
  }
  try {
    const user = await User.findById(id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "no user found" });
    }
    res.status(200).json({ message: "success", data: user });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch user detail", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid id" });
  }
  const user = await User.findByIdAndDelete(id);
  try {
    if (!user) {
      return res.status(404).json({ message: "cannot delete user, user not found" });
    }
    res.status(201).json({ message: "success", user: user.username });
  } catch (err) {
    res.status(500).json({ message: "fail to fetch delete user", error: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid id" });
  }
  const { username, email, password, phone, isAdmin, alamat } = req.body;
  const updatedData = { username, email, phone, isAdmin, alamat };
  if (password) {
    updatedData.passwordHash = bcrypt.hashSync(password, 10);
  }

  try {
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true }).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ message: "success", data: user });
  } catch (err) {
    return res.status(500).json({ message: "fail to update user", error: err.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Wrong password" });
    }

    const secret = process.env.secret;
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "3d" }
    );

    return res.status(200).json({ success: true, message: "Login successful", data: { user: user.email, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fail to fetch login", error: error.message });
  }
};
