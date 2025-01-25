import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-16 pb-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">À PROPOS DE MONSITE</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-[#FF6E14]">Qui sommes-nous ?</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-[#FF6E14]">Nous rejoindre</Link></li>
              <li><Link to="/impact" className="text-gray-600 hover:text-[#FF6E14]">Impact environnemental</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">INFORMATIONS LÉGALES</h3>
            <ul className="space-y-2">
              <li><Link to="/conditions" className="text-gray-600 hover:text-[#FF6E14]">Conditions générales d'utilisation</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-[#FF6E14]">Politique de confidentialité</Link></li>
              <li><Link to="/cookies" className="text-gray-600 hover:text-[#FF6E14]">Politique de cookies</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">NOS SOLUTIONS PROS</h3>
            <ul className="space-y-2">
              <li><Link to="/pro" className="text-gray-600 hover:text-[#FF6E14]">Publicité</Link></li>
              <li><Link to="/pro/pricing" className="text-gray-600 hover:text-[#FF6E14]">Professionnels</Link></li>
              <li><Link to="/pro/features" className="text-gray-600 hover:text-[#FF6E14]">Vos avantages</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">DES QUESTIONS ?</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-600 hover:text-[#FF6E14]">Aide</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-[#FF6E14]">Contact</Link></li>
              <li><Link to="/safety" className="text-gray-600 hover:text-[#FF6E14]">Sécurité</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">© 2024 MonSite - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};