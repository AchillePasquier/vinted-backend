const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: String,
  product_description: String,
  product_price: Number,
  product_details: Array,
  product_image: { type: mongoose.Schema.Types.Mixed, default: {} }, // si j'envois pas de product_image par défaut ce sera un objet vide
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Offer;
