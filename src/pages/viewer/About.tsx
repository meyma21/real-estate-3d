import React from 'react';
import ViewerHeader from '../../components/layout/ViewerHeader';
import { Building2, Award, Users, Heart, CheckCircle2, Leaf, Shield, Sparkles } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: <Building2 className="w-8 h-8 text-teal-600" />,
      title: "Architecture Moderne",
      description: "Un design contemporain qui allie esthétique et fonctionnalité, créant des espaces de vie exceptionnels."
    },
    {
      icon: <Award className="w-8 h-8 text-teal-600" />,
      title: "Qualité Premium",
      description: "Des matériaux de haute qualité et une finition soignée pour un confort de vie optimal."
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: "Communauté",
      description: "Un environnement convivial où les résidents peuvent créer des liens et partager des moments."
    },
    {
      icon: <Heart className="w-8 h-8 text-teal-600" />,
      title: "Services Dédiés",
      description: "Une équipe à votre service pour répondre à tous vos besoins et assurer votre bien-être."
    },
    {
      icon: <Leaf className="w-8 h-8 text-teal-600" />,
      title: "Écologique",
      description: "Des solutions durables et respectueuses de l'environnement pour un avenir plus vert."
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      title: "Sécurité",
      description: "Un système de sécurité de pointe pour garantir votre tranquillité d'esprit."
    }
  ];

  const values = [
    {
      icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
      text: "Excellence dans chaque détail"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
      text: "Innovation constante"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
      text: "Satisfaction client prioritaire"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
      text: "Développement durable"
    }
  ];

  const team = [
    {
      name: "Jean Dupont",
      role: "Directeur du Projet",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      description: "Plus de 15 ans d'expérience dans le développement immobilier de luxe."
    },
    {
      name: "Marie Martin",
      role: "Architecte en Chef",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      description: "Diplômée de l'École d'Architecture de Paris, spécialiste en design contemporain."
    },
    {
      name: "Pierre Durand",
      role: "Responsable Commercial",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      description: "Expert en relations clients et en négociation immobilière."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <ViewerHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="relative bg-slate-900 text-white">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop"
              alt="Modern building"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-90"></div>
          </div>
          <div className="container mx-auto px-4 py-32 relative">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Notre Vision de l'Immobilier
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Nous créons des espaces de vie exceptionnels qui allient confort, 
                élégance et durabilité pour offrir une expérience de vie unique.
              </p>
              <div className="flex flex-wrap gap-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                    {value.icon}
                    <span>{value.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                À Propos de Notre Projet
              </h2>
              <p className="text-slate-600 mb-6">
                Notre projet immobilier représente l'aboutissement de plusieurs années 
                d'expérience dans le développement de propriétés de luxe. Nous avons 
                créé un ensemble résidentiel qui répond aux plus hautes exigences 
                en termes de qualité, de confort et d'esthétique.
              </p>
              <p className="text-slate-600 mb-6">
                Situé dans un emplacement privilégié, notre projet offre un accès 
                facile aux commodités essentielles tout en préservant un cadre de 
                vie paisible et agréable. Chaque appartement a été conçu avec 
                attention aux détails pour offrir un espace de vie optimal.
              </p>
              <p className="text-slate-600">
                Notre engagement envers l'excellence se reflète dans chaque aspect 
                du projet, de la sélection des matériaux à la qualité de la 
                construction, en passant par les services proposés aux résidents.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
                  alt="Vue intérieure"
                  className="rounded-lg shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"
                  alt="Vue extérieure"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop"
                  alt="Détails architecturaux"
                  className="rounded-lg shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop"
                  alt="Espace commun"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Ce Qui Nous Rend Uniques
              </h2>
              <p className="text-slate-600">
                Découvrez les caractéristiques qui font de notre projet un lieu de vie exceptionnel
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-center">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Notre Équipe
            </h2>
            <p className="text-slate-600">
              Des professionnels passionnés à votre service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <div className="absolute inset-0 bg-teal-600 rounded-full transform rotate-3 transition-transform group-hover:rotate-6"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                <p className="text-slate-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Prêt à Découvrir Votre Futur Chez-Vous ?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Contactez-nous dès aujourd'hui pour planifier une visite et découvrir 
              pourquoi notre projet est le choix idéal pour votre nouveau foyer.
            </p>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors">
              Prendre Rendez-vous
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About; 