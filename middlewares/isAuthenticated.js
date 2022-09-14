const User = require("../models/User");

// req.header = objet contenant une clé authorization qui contient une chaine de caractères "Bearer + un token"

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    // chercher le user dans la BDD en supprimant le Bearer + espace pour n'avoir que le token
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    }); //.select("account _id") à la fin permet de prendre que ces champs là et ainsi éviter le hash et le salt

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = user;
      // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé pourra avoir accès à req.user
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
