import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import ApiError from "./utils/ApiError.js";
import errorHandler from "./utils/errorHandler.js";
import { jwtAuthMiddleware } from "./middlewares/auth.middleware.js";

// Routes
import user from "./routes/user.routes.js";
import notes from "./routes/notes.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ----------- Middlewares ----------
const allowedOrigins = [
  "http://localhost:5173",                  // for local development
  "https://notebook-1-1sy0.onrender.com"   // deployed frontend
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

// --------- API Routes (MUST come first) -------------
app.use("/api/v1/user", user);
app.use("/api/v1/notes", jwtAuthMiddleware, notes);

// --------- API 404 for invalid API endpoints (MUST come before static files) ----------
app.use("/api/*", (req, res, next) => {
  const err = new ApiError(
    404,
    "fail",
    `Can't find ${req.originalUrl} on the server`
  );
  next(err);
});

// --------- Serve React build static files ----------
app.use(express.static(path.join(__dirname, "client/build")));

// --------- React Router catch-all (MUST be last route) ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// ----------------- Error handler ---------
app.use(errorHandler);

export default app;
