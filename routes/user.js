const express = require("express");
const router = express.Router();

const User = require("../models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// Il faut éviter de renvoyer côté client le hash et le salt

// create a user = sign up
router.post("/user/signup", async (req, res) => {
  const { email, username, password, newsletter } = req.fields; // 0n destructure pour éviter d'écrire après password = req.fields.password , etc.
  try {
    // Est-ce qu'il y a déjà un utilisateur qui possède cet email dans la base de données ?
    const user = await User.findOne({ email: email });
    // Si oui on renvoie un message et on ne procède pas à l'inscription
    if (user) {
      res.status(409).json({ message: "This e-mail already as an account" });
    } else {
      // Sinon on peut créer un nouveau User
      if (email && username && password) {
        // Étape 1 : encrypter le mot de passe et générer un token
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64); // SHA256(password + salt) renvoit un objet : on le convertit donc en chaine de 64 caractères
        // Étape 2 : créer un nouveau user
        const newUser = new User({
          email: email,
          account: {
            username: username,
          },
          newsletter: newsletter,
          salt: salt,
          hash: hash,
          token: token,
        });
        // Étape 3 : sauvegarder ce user dans la BDD
        await newUser.save();
        // Étape 4 : répondre au client
        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({
          message: "Missing parameters",
        });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// router.post("/user/signup", async (req, res) => {
//   console.log(req.fields);
//   try {
//     const username = req.fields.username;
//     if (username.length < 1) {
//       return res.json({ message: "enter an username" });
//     }
//     const email = req.fields.email;
//     const existingUsers = await User.find();
//     console.log(existingUsers);
//     for (let i = 0; i < existingUsers.length; i++) {
//       if (email === existingUsers[i]["email"]) {
//         return res.json({ message: "email already used" });
//       }
//     }
//     const password = req.fields.password;
//     const salt = uid2(16);
//     const token = uid2(16);

//     const newUser = new User({
//       email: email,
//       account: {
//         username: username,
//       },
//       newsletter: req.fields.newsletter,
//       salt: salt,
//       hash: SHA256(password + salt).toString(encBase64),
//       token: token,
//     });
//     await newUser.save();
//     res.json({
//       id: newUser.id,
//       token: newUser.token,
//       account: newUser.account,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// LOGIN

// router.post("/user/login", async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });

//     if (user) {
//       // Est-ce qu'il a rentré le bon mot de passe ?
//       // req.body.password
//       // user.hash
//       // user.salt
//       if (
//         SHA256(req.body.password + user.salt).toString(encBase64) === user.hash
//       ) {
//         res.status(200).json({
//           _id: user._id,
//           token: user.token,
//           account: user.account,
//         });
//       } else {
//         res.status(401).json({ error: "Unauthorized" });
//       }
//     } else {
//       res.status(400).json({ message: "User not found" });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.json({ message: error.message });
//   }
// });

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    // Chercher quel est l'utilisateur qui veut se connecter
    const user = await User.findOne({ email: email });
    // console.log(user);
    if (user) {
      // S'il existe
      // Vérifier que le mot de passe est le bon
      const hashToVerify = SHA256(password + user.salt).toString(encBase64);
      if (hashToVerify === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized 1" });
      }
    } else {
      // Sinon : unauthorized
      res.status(400).json({ message: "Unauthorized 2" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// router.post("/user/login", async (req, res) => {
//   console.log(req.fields);
//   try {
//     const loggingInUser = await User.findOne({ email: req.fields.email });
//     console.log(loggingInUser);
//     if (loggingInUser === null) {
//       return res.json({ message: "account not found" });
//     }
//     const password = req.fields.password;
//     console.log(password);
//     const hashToCheck = SHA256(password + loggingInUser.salt).toString(
//       encBase64
//     );
//     console.log(loggingInUser.salt);
//     console.log(hashToCheck);
//     if (hashToCheck !== loggingInUser.hash) {
//       return res.json({ error: "incorrect password" });
//     } else {
//       res.json({ message: "success", token: loggingInUser.token });
//     }
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

module.exports = router;
