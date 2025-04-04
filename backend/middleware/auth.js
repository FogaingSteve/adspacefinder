
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Token manquant');
    }

    // Vérifier le token Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error("Erreur Supabase:", error);
      throw new Error('Token invalide');
    }

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    req.userId = user.id;
    next();
  } catch (error) {
    console.log("Erreur d'authentification:", error);
    res.status(401).json({ message: "Veuillez vous connecter" });
  }
};

// Middleware pour vérifier JWT token pour l'admin
const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Token administrateur manquant');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.isAdmin) {
      throw new Error('Accès administrateur non autorisé');
    }
    
    req.adminId = decoded.id;
    next();
  } catch (error) {
    console.log("Erreur d'authentification admin:", error);
    res.status(401).json({ message: "Accès administrateur refusé" });
  }
};

module.exports = { auth, adminAuth };
