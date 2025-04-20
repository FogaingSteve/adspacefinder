
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

    // Try JWT validation first for MongoDB users
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.userId) {
        req.userId = decoded.userId;
        console.log("JWT Auth success, user ID:", decoded.userId);
        return next();
      }
    } catch (jwtError) {
      console.log("JWT validation failed, trying Supabase:", jwtError.message);
      // Continue to Supabase validation if JWT fails
    }

    // Vérifier le token Supabase
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw new Error('Token invalide');
      }

      if (!data.user) {
        throw new Error('Utilisateur non trouvé');
      }

      req.userId = data.user.id;
      console.log("Supabase Auth success, user ID:", data.user.id);
      next();
    } catch (supabaseError) {
      console.error("Erreur Supabase:", supabaseError.message);
      throw new Error('Token invalide ou expiré');
    }
  } catch (error) {
    console.log("Erreur d'authentification:", error.message);
    res.status(401).json({ message: "Veuillez vous connecter" });
  }
};

// Middleware pour vérifier JWT token pour l'admin
const adminAuth = (req, res, next) => {
  try {
    console.log("Verifying admin token");
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log("Admin token missing");
      throw new Error('Token administrateur manquant');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Admin token decoded:", decoded);
      
      if (!decoded) {
        console.log("Admin token invalid");
        throw new Error('Token invalide');
      }
      
      if (!decoded.isAdmin) {
        console.log("Not an admin user:", decoded);
        throw new Error('Accès administrateur non autorisé');
      }
      
      req.adminId = decoded.userId;
      console.log("Admin auth success, ID:", decoded.userId);
      next();
    } catch (error) {
      console.log("Error decoding admin token:", error.message);
      throw new Error('Token administrateur invalide ou expiré');
    }
  } catch (error) {
    console.log("Admin authentication error:", error.message);
    res.status(401).json({ message: "Accès administrateur refusé" });
  }
};

module.exports = { auth, adminAuth };
