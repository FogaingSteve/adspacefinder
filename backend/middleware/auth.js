
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'your-project-url',
  process.env.SUPABASE_SERVICE_KEY || 'your-service-key'
);

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Token manquant');
    }

    // Vérifier le token Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Token invalide');
    }

    req.userId = user.id; // Ajouter l'ID de l'utilisateur à la requête
    next();
  } catch (error) {
    console.log("Erreur d'authentification:", error);
    res.status(401).json({ message: "Veuillez vous connecter" });
  }
};

module.exports = auth;
