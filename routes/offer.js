const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

const cloudinary = require("cloudinary").v2;
// Données à remplacer avec vos credentials :
cloudinary.config({
  cloud_name: process.env.cloud_nameS,
  api_key: process.env.api_keyS,
  api_secret: process.env.api_secretS,
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  // la focntion isAuthenticated permet églament de transférer les infos du user connecté. Avec req.user on accède aux infos du user
  try {
    const { title, description, price, condition, city, brand, size, color } =
      req.fields;
    // Créer une nouvelle annonce (sans image)
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });
    // console.log(newOffer);
    // Envoie de l'image à Cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    // console.log(result);
    // Ajoute result à product_image
    newOffer.product_image = result;
    // Sauvegarder l'annonce
    await newOffer.save();
    res.json({
      _id: newOffer._id,
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_price: newOffer.product_price,
      product_details: newOffer.product_details,
      owner: {
        account: newOffer.owner.account,
        _id: newOffer.owner._id,
      },
      product_image: newOffer.product_image,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/offers", async (req, res) => {
  try {
    const filtersObject = {};

    //gestion du Title
    if (req.query.title) {
      filtersObject.product_name = new RegExp(req.query.title, "i");
    }

    //gestion du prix minimum
    if (req.query.priceMin) {
      filtersObject.product_price = { $gte: req.query.priceMin };
    }

    //gestion du prix maximum si j'ai déjà une clé product_price dans mon objet objectFilters
    if (req.query.priceMax) {
      if (filtersObject.product_price) {
        filtersObject.product_price.$lte = req.query.priceMax;
      } else {
        filtersObject.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }
    //gestion du tri avec l'objet sortObject
    const sortObject = {};
    if (req.query.sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sortObject.product_price = "asc";
    }

    // console.log(filtersObject);
    //gestion de la pagination
    // On a par défaut 5 annonces par page
    //Si ma page est égale à 1 je devrais skip 0 annonces
    //Si ma page est égale à 2 je devrais skip 5 annonces
    //Si ma page est égale à 4 je devrais skip 15 annonces

    //(1-1) * 5 = skip 0 ==> PAGE 1
    //(2-1) * 5 = SKIP 5 ==> PAGE 2
    //(4-1) * 5 = SKIP 15 ==> PAGE 4
    // ==> (PAGE - 1) * LIMIT

    let limit = 12;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }

    let page = 1;
    if (req.query.page) {
      if (Number(req.query.page) < 1) {
        page = 1;
      } else {
        page = Number(req.query.page);
      }
    }

    const offers = await Offer.find(filtersObject)
      .sort(sortObject)
      .skip((page - 1) * limit)
      .limit(limit);
    // .select("product_name product_price");

    const count = await Offer.countDocuments(filtersObject);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
