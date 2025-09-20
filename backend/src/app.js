import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import ApiError from "./utils/ApiError.js";
import errorHandler from "./utils/errorHandler.js";
import { jwtAuthMiddleware } from "./middlewares/auth.middleware.js";
const app = express();

// ----------- Middlewares ----------
const allowedOrigins = [
  "http://localhost:5173",                  // for local development
  "https://notebook-1-1sy0.onrender.com"   // for deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow tools like Postman
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy: Origin not allowed"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.options("*", cors());

app.use(bodyParser.json());

// --------- Import Routes -------------
import user from "./routes/user.routes.js";
import notes from "./routes/notes.routes.js";
app.get("/", (req, res) => {
    res.send("API is running");
  });
// ----------- Routes declaration ---------
app.use("/api/v1/user", user);
app.use("/api/v1/notes", jwtAuthMiddleware, notes);

// ----------- It is used for incorrect endpoint and wrong api requests ----------
app.use("*", (req, res, next) => {
  // =============== x ==================
  //   const err = new Error(`Can't find ${req.originalUrl} on the server`);
  //   err.status = "fail";
  //   err.statusCode = 404;
  const err = new ApiError(
    404,
    "fail",
    `Can't find ${req.originalUrl} on the server`
  );
  next(err);
});

// ----------------- Error handler ---------
app.use(errorHandler);

// --------- Export ----------
export default app;
