
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    // Vérifier le token avec une clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre-cle-secrete');
    req.userId = decoded.userId; // Ajouter l'ID de l'utilisateur à la requête
    next();
  } catch (error) {
    console.log("Erreur d'authentification:", error);
    res.status(401).json({ message: "Veuillez vous connecter" });
  }
};

module.exports = auth;
