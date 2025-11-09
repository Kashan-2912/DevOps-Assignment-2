import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"

// db
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173", // For local dev
  "http://3.110.105.30:5173",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept']
};

const __dirname = path.resolve();

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.json({limit: "10mb"})) // allow to parse body of request
app.use(express.static('public'));
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  // dev: serve public folder (or nothing)
  app.use(express.static(path.join(__dirname, "public")));
  // you may keep a catch-all for dev if needed
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  });
}

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
//     connectDB();
// })

(async () => {
  try {
    await connectDB(); // ensure your connectDB returns a Promise and rejects on failure
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server - DB connect error:", err);
    process.exit(1);
  }
})();
