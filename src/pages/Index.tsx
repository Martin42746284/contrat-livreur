import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, FileText } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8 text-center animate-fade-in">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-6">
            <ShieldCheck size={16} className="text-accent" />
            <span className="text-sm font-medium text-foreground">Contrats sécurisés avec vérification CIN</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Gestion de Contrats
          </h1>
          <p className="text-muted-foreground">
            Choisissez le type de contrat à créer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/contract/new')}
            className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3"
          >
            <div className="w-12 h-12 rounded-lg gradient-navy flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">Contrat de Vente</h3>
            <p className="text-sm text-muted-foreground">Fournisseuse ↔ Distributrice</p>
          </button>

          <button
            onClick={() => navigate('/delivery')}
            className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3"
          >
            <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center text-accent-foreground group-hover:scale-105 transition-transform">
              <Truck size={24} />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">Contrat Livreur</h3>
            <p className="text-sm text-muted-foreground">Fournisseur/Distributeur ↔ Livreur</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
