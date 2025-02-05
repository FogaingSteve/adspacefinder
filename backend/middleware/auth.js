
const { createClient } = require('@supabase/supabase-js');

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

module.exports = auth;
