const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const kycRoutes = require("./routes/kycRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.use("/api/kyc", kycRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Backend running on port", process.env.PORT || 5000);
    });
  })
  .catch((err) => console.log("MongoDB error:", err));
