require("dotenv").config();

const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");

const app = express();
app.use(formidableMiddleware());

mongoose.connect(process.env.MONGODB_URI);

const cors = require("cors");
app.use(cors());

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API de Vinted" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas." });
});

// Pour démarrer le serveur :
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
