
import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// FAQ data
const faqData = [
  {
    category: "Compte et inscription",
    items: [
      {
        question: "Comment créer un compte ?",
        answer: "Pour créer un compte, cliquez sur 'S'inscrire' en haut à droite de la page d'accueil. Remplissez le formulaire avec vos informations personnelles et validez. Vous recevrez un email de confirmation pour activer votre compte."
      },
      {
        question: "Comment modifier mes informations personnelles ?",
        answer: "Connectez-vous à votre compte, puis accédez à la section 'Profil' depuis le menu déroulant de votre avatar. Vous pourrez y modifier vos informations personnelles, votre mot de passe et vos préférences de notification."
      },
      {
        question: "J'ai oublié mon mot de passe, que faire ?",
        answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Saisissez l'adresse email associée à votre compte et suivez les instructions envoyées par email pour réinitialiser votre mot de passe."
      }
    ]
  },
  {
    category: "Annonces",
    items: [
      {
        question: "Comment publier une annonce ?",
        answer: "Connectez-vous à votre compte, puis cliquez sur le bouton 'Déposer une annonce' en haut de la page. Remplissez le formulaire avec les détails de votre article, ajoutez des photos et définissez votre prix. Validez pour publier votre annonce."
      },
      {
        question: "Combien coûte la publication d'une annonce ?",
        answer: "La publication d'annonces pour les particuliers est entièrement gratuite. Des options de mise en avant payantes sont disponibles pour augmenter la visibilité de vos annonces."
      },
      {
        question: "Comment modifier ou supprimer mon annonce ?",
        answer: "Accédez à la section 'Mes annonces' dans votre espace personnel. Trouvez l'annonce concernée et cliquez sur 'Modifier' ou 'Supprimer' selon votre besoin."
      },
      {
        question: "Pourquoi mon annonce a-t-elle été refusée ?",
        answer: "Votre annonce peut être refusée si elle ne respecte pas nos conditions d'utilisation (contenu inapproprié, article interdit à la vente, photos de mauvaise qualité, etc.). Un email explicatif vous est envoyé en cas de refus."
      }
    ]
  },
  {
    category: "Achat et vente",
    items: [
      {
        question: "Comment contacter un vendeur ?",
        answer: "Sur la page de l'annonce, cliquez sur le bouton 'Contacter' ou utilisez les coordonnées affichées si le vendeur les a rendues visibles. Vous pouvez également utiliser notre système de messagerie interne."
      },
      {
        question: "Comment se déroule la transaction ?",
        answer: "Notre plateforme met simplement en relation acheteurs et vendeurs. La transaction (paiement, livraison ou remise en main propre) est organisée directement entre les deux parties. Nous recommandons de privilégier les remises en main propre dans des lieux publics."
      },
      {
        question: "Existe-t-il un système de protection pour les acheteurs ?",
        answer: "Nous n'intervenons pas dans les transactions, mais nous vous conseillons de rester vigilant : vérifiez la réputation du vendeur, privilégiez les rencontres en personne et n'envoyez jamais d'argent à l'avance par des moyens non sécurisés."
      }
    ]
  },
  {
    category: "Problèmes techniques",
    items: [
      {
        question: "Je n'arrive pas à télécharger mes photos, que faire ?",
        answer: "Vérifiez que vos images respectent nos critères : format JPG, PNG ou GIF, taille maximale de 5 Mo par image. Si le problème persiste, essayez de réduire la taille de vos images ou d'utiliser un autre navigateur."
      },
      {
        question: "L'application mobile ne fonctionne pas correctement",
        answer: "Assurez-vous d'utiliser la dernière version de notre application. Si le problème persiste, essayez de la désinstaller puis de la réinstaller. Si cela ne résout pas le problème, contactez notre support technique."
      }
    ]
  }
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter FAQ items based on search term
  const filteredFaq = searchTerm 
    ? faqData.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : faqData;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Questions fréquemment posées</h1>
      
      <div className="max-w-xl mx-auto mb-10 relative">
        <Input
          type="text"
          placeholder="Rechercher une question..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>
      
      {filteredFaq.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucun résultat trouvé pour "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredFaq.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
              <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`}>
                    <AccordionTrigger className="px-4 py-4 hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <p className="text-gray-700">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-16 bg-primary/5 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
        <p className="text-gray-700 mb-4">
          Notre équipe support est disponible pour vous aider avec toutes vos questions.
        </p>
        <Button
          variant="default"
          onClick={() => window.location.href = '/contact'}
        >
          Contactez-nous
        </Button>
      </div>
    </div>
  );
};

export default FAQ;
