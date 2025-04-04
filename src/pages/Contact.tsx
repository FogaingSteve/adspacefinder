
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin, Phone, Mail } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Votre message a été envoyé avec succès! Nous vous contacterons bientôt.");
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Contactez-nous</h1>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-gray-700 mb-8">
            Nous sommes là pour vous aider et répondre à toutes vos questions. 
            N'hésitez pas à nous contacter en utilisant le formulaire ci-dessous 
            ou par les moyens directs indiqués.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <MapPin className="text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Notre adresse</h3>
                <address className="text-gray-600 not-italic">
                  123 Avenue des Petites Annonces<br />
                  75001 Paris, France
                </address>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Phone className="text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Téléphone</h3>
                <p className="text-gray-600">+33 1 23 45 67 89</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Mail className="text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">contact@monsite.com</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Heures d'ouverture</h2>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="font-medium">Lundi - Vendredi:</span>
                <span>9h - 18h</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Samedi:</span>
                <span>10h - 16h</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Dimanche:</span>
                <span>Fermé</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Envoyez-nous un message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input 
                id="subject" 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                name="message" 
                rows={5} 
                value={formData.message} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
