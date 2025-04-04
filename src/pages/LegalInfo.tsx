
import React from 'react';

const LegalInfo = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Informations Légales</h1>
      
      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Mentions légales</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-4">MonSite est édité par la société MonSite SAS</p>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Siège social :</strong> 123 Avenue des Petites Annonces, 75001 Paris, France</li>
              <li><strong>Capital social :</strong> 50 000 €</li>
              <li><strong>SIRET :</strong> 123 456 789 00012</li>
              <li><strong>RCS :</strong> Paris 123 456 789</li>
              <li><strong>N° TVA intracommunautaire :</strong> FR 12 345678901</li>
              <li><strong>Directeur de la publication :</strong> Alexandre Dubois</li>
              <li><strong>Contact :</strong> contact@monsite.com</li>
            </ul>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Conditions Générales d'Utilisation</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">1. Objet</h3>
              <p className="text-gray-700">
                Les présentes Conditions Générales d'Utilisation ont pour objet de définir les termes et conditions dans lesquels 
                MonSite met à la disposition des utilisateurs sa plateforme de petites annonces, ainsi que les règles d'utilisation du service.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">2. Acceptation des CGU</h3>
              <p className="text-gray-700">
                L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, 
                vous ne devez pas utiliser notre service.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">3. Inscription et compte utilisateur</h3>
              <p className="text-gray-700">
                Pour publier une annonce, l'utilisateur doit créer un compte en fournissant des informations exactes et complètes. 
                L'utilisateur est seul responsable de la protection de ses identifiants de connexion et de toutes les activités effectuées 
                avec son compte.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">4. Publication d'annonces</h3>
              <p className="text-gray-700">
                L'utilisateur s'engage à publier des annonces conformes à la réalité, ne contenant aucun contenu illégal, offensant ou 
                frauduleux. MonSite se réserve le droit de supprimer toute annonce ne respectant pas ces conditions.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">5. Responsabilité</h3>
              <p className="text-gray-700">
                MonSite agit comme simple intermédiaire technique permettant la mise en relation entre acheteurs et vendeurs. 
                Nous ne sommes pas partie aux transactions conclues entre utilisateurs et déclinons toute responsabilité quant 
                à la qualité, la sécurité ou la légalité des biens échangés.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">6. Modification des CGU</h3>
              <p className="text-gray-700">
                MonSite se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des 
                changements significatifs par notification sur le site.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Politique de confidentialité</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">1. Collecte des données</h3>
              <p className="text-gray-700">
                Nous collectons certaines informations personnelles lors de votre inscription et utilisation de nos services, 
                notamment : nom, adresse email, numéro de téléphone, localisation, historique des annonces publiées et consultées.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">2. Utilisation des données</h3>
              <p className="text-gray-700">
                Les données collectées nous permettent de fournir nos services, améliorer notre plateforme, personnaliser votre 
                expérience utilisateur et communiquer avec vous concernant votre compte ou nos services.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">3. Protection des données</h3>
              <p className="text-gray-700">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès, 
                modification, divulgation ou destruction non autorisés.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">4. Cookies</h3>
              <p className="text-gray-700">
                Notre site utilise des cookies pour améliorer votre expérience utilisateur, analyser l'utilisation de notre 
                plateforme et personnaliser le contenu. Vous pouvez configurer votre navigateur pour refuser les cookies, mais 
                certaines fonctionnalités du site pourraient ne plus être accessibles.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">5. Vos droits</h3>
              <p className="text-gray-700">
                Conformément à la législation en vigueur, vous disposez d'un droit d'accès, de rectification, de suppression et 
                d'opposition concernant vos données personnelles. Pour exercer ces droits, veuillez nous contacter à l'adresse 
                privacy@monsite.com.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LegalInfo;
