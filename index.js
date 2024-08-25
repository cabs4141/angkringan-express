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
import cartRouters from "./routes/orderRoutes.js";
import authJwt from "./middleware/jwt.js";
import { errorHandler } from "./middleware/error.js";
import cors from "cors";

//express
const app = express();
app.use(cors());

//dotenv
dotenv.config();
const port = process.env.PORT;
const apiUrl = process.env.API_URL;

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
app.use(`${apiUrl}/orders`, cartRouters);

//dbconnection
databaseConnection();

//listen
app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
