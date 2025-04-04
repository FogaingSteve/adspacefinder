
import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">À propos de nous</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
          <p className="text-gray-700">
            Notre plateforme a été créée avec une mission simple mais puissante : faciliter les échanges et le commerce 
            entre particuliers et professionnels. Nous croyons en une économie collaborative qui permet à chacun de donner 
            une seconde vie à ses objets, de trouver ce dont il a besoin à prix abordable, et de créer des liens dans 
            sa communauté locale.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
          <p className="text-gray-700">
            Fondée en 2023, notre plateforme a rapidement grandi pour devenir un acteur majeur des petites 
            annonces en ligne. Ce qui a commencé comme une simple idée est maintenant une communauté dynamique 
            de milliers d'utilisateurs qui achètent, vendent et échangent quotidiennement.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Nos Valeurs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-xl mb-2">Simplicité</h3>
              <p className="text-gray-700">Nous croyons que la technologie doit simplifier votre vie, pas la compliquer. Notre plateforme est conçue pour être intuitive et facile à utiliser.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-xl mb-2">Sécurité</h3>
              <p className="text-gray-700">La sécurité de nos utilisateurs est notre priorité absolue. Nous travaillons constamment à améliorer nos mesures de protection et de vérification.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-xl mb-2">Communauté</h3>
              <p className="text-gray-700">Nous encourageons les échanges respectueux et la création de liens entre les membres de notre communauté.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-xl mb-2">Durabilité</h3>
              <p className="text-gray-700">En favorisant la réutilisation des objets, nous contribuons à réduire les déchets et à promouvoir une consommation plus responsable.</p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Notre Équipe</h2>
          <p className="text-gray-700 mb-6">
            Notre équipe diversifiée et passionnée travaille chaque jour pour améliorer votre expérience. 
            Composée d'experts en technologie, en service client et en développement commercial, elle partage 
            une vision commune : créer la meilleure plateforme de petites annonces possible.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="font-semibold text-lg">Alexandre Dubois</h3>
              <p className="text-gray-600">Fondateur & CEO</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="font-semibold text-lg">Sophie Martin</h3>
              <p className="text-gray-600">Directrice des Opérations</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="font-semibold text-lg">Thomas Leroy</h3>
              <p className="text-gray-600">Directeur Technique</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
