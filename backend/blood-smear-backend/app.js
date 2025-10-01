require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const uploadRoute = require("./routes/uploadImagesRoute");
const getUploadRoute = require("./routes/getUploadImageRoute");
const speciesRoute = require("./routes/speciesRoute");
const { connectProducer } = require("./Kafka/KafkaClient");
const cors = require("cors");



const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(
  process.env.MONGO_URI ||
    "mongodb+srv://skhsingh:kJcy8ZWBATFV6uz8@cluster0.2c0gaiq.mongodb.net/Blood_Smear_Database?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

connectProducer()
  .then(() => console.log("Kafka producer connected!"))
  .catch((err) => console.error("Kafka connection error:", err));
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// Routes
app.use("/api", uploadRoute);
app.use("/api", getUploadRoute);
app.use("/api/species", speciesRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
