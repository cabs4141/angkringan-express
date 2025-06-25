//path import
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import databaseConnection from "./database/database.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import authJwt from "./middleware/jwt.js";
import { errorHandler } from "./middleware/error.js";
import cors from "cors";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import User from "./models/userModels.js";
//express
const app = express();

app.use(cors());

//dotenv
dotenv.config();
const port = process.env.PORT;
const apiUrl = process.env.API_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(path.join(__dirname, "/public/uploads")));
app.use(errorHandler);

//middleware routes
app.use(`${apiUrl}/products`, productRoutes);
app.use(`${apiUrl}/users`, userRoutes);
app.use(`${apiUrl}/categories`, categoryRoutes);
app.use(`${apiUrl}/orders`, orderRoutes);
app.use(`${apiUrl}/cart`, cartRoutes);
app.use(`${apiUrl}/recommend`, recommendRoutes);

//dbconnection
databaseConnection();

//oauth
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "https://angkringan-express-production.up.railway.app/api/v1/oauth");

const scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"];
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
  redirect_uri: "https://angkringan-express-production.up.railway.app/api/v1/oauth", // Pastikan URL ini sama dengan yang terdaftar di Google Console
});

app.get(`${apiUrl}/auth/google`, (req, res) => {
  res.redirect(authorizationUrl);
});

// app.get(`${apiUrl}/oauth`, async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) {
//       return res.status(400).json({ message: "Missing code parameter" });
//     }
//     const { tokens } = await oauth2Client.getToken(code);

//     oauth2Client.setCredentials(tokens);

//     const oauth2 = google.oauth2({
//       auth: oauth2Client,
//       version: "v2",
//     });

//     const response = await oauth2.userinfo.get();
//     const data = response.data; // Ambil data dari response

//     // Cek apakah email dan name tersedia
//     if (!data || !data.email || !data.name) {
//       return res.status(400).json({ message: "Failed to get user info from Google" });
//     }

//     let user = await User.findOne({ email: data.email });

//     if (!user) {
//       // Buat user baru jika belum ada
//       user = new User({
//         username: data.name,
//         email: data.email,
//         passwordHash: null, // Kosongkan password untuk user OAuth
//       });

//       await user.save();
//     }

//     const secret = process.env.secret;
//     const token = jwt.sign(
//       {
//         userId: user.id,
//         isAdmin: user.isAdmin,
//       },
//       secret,
//       { expiresIn: "3d" }
//     );

//     // Respon sukses
//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         name: user.name,
//         user: user.email, // Menampilkan email user
//         token, // Token yang diberikan
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.get(`${apiUrl}/oauth`, async (req, res) => {
//   const code = req.query.code;
//   console.log(`Authorization code: ${code}`);
//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//     res.send("OAuth flow successful!");
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     res.status(500).send("Error: " + error.message);
//   }
// });

app.post(`${apiUrl}/auth/google/callback`, async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: clientId, // Sesuaikan dengan CLIENT_ID Anda
    });
    const payload = ticket.getPayload();
    console.log(payload); // Cek apakah 'picture' ada di sini

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Jika user belum ada, buat user baru
      user = new User({
        username: name,
        email,
        passwordHash: null, // Kosongkan password untuk user OAuth
        profilePicture: picture,
      });
      await user.save();
    }

    const secret = process.env.secret;
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "3d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        name: user.username,
        email: user.email,
        profilePicture: user.profilePicture,

        token: jwtToken,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//listen
app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
