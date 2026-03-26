const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// ROUTES
const ticketRoutes = require("./routes/ticketRoutes");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// APP INIT
const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));

// ================= ROUTES =================
app.use("/api/tickets", ticketRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes); // 🔥 M-PESA ROUTE

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));

// ================= DEFAULT ROUTE =================
app.get("/", (req, res) => {
    res.send("🚀 EventPass Backend Running...");
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
});