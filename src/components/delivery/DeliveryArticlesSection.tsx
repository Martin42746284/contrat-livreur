import React from 'react';

const sectionClass = 'rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in shadow-contract';
const articleTitle = 'font-display text-base font-semibold text-foreground';

const DeliveryArticlesSection: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className={sectionClass}>
        <h3 className={articleTitle}>📋 Article 1 : Objet du contrat</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          Le présent contrat a pour objet de définir les conditions de collaboration entre la Partie principale et le Livreur pour l'acheminement des marchandises aux clients finaux.
        </p>
      </div>

      <div className={sectionClass}>
        <h3 className={articleTitle}>📦 Article 2 : Responsabilité des marchandises</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          Le Livreur est responsable des marchandises qui lui sont confiées dès leur prise en charge jusqu'à la remise effective au client. Il s'engage à les transporter avec soin et à les protéger contre tout dommage.
        </p>
      </div>

      <div className={sectionClass}>
        <h3 className={articleTitle}>⚠️ Article 3 : Perte ou détérioration</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          En cas de perte ou détérioration des marchandises pendant le transport, le Livreur en assume l'entière responsabilité et s'engage à rembourser la valeur des articles concernés dans un délai de 7 jours.
        </p>
      </div>

      <div className={sectionClass}>
        <h3 className={articleTitle}>⚖️ Article 4 : Litige</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          En cas de litige entre les parties, celles-ci s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut d'accord amiable dans un délai de 30 jours, le litige sera soumis aux juridictions compétentes.
        </p>
      </div>

      <div className={sectionClass}>
        <h3 className={articleTitle}>🔚 Article 5 : Résiliation</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          Chaque partie peut résilier le contrat avec un préavis de 15 jours, sauf en cas de faute grave entraînant une résiliation immédiate sans préavis.
        </p>
      </div>

      <div className={sectionClass}>
        <h3 className={articleTitle}>📅 Article 6 : Durée</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          Le présent contrat est conclu pour une durée de 12 mois à compter de sa date de validation. Il est renouvelable par accord mutuel des parties.
        </p>
      </div>

      <div className={sectionClass}>
        <h3 className={articleTitle}>🚨 Article 7 : Détournement et faute grave</h3>
        <p className="text-sm font-medium text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20">
          Le livreur accepte que toute tentative de fraude, dissimulation ou fuite constitue une faute grave entraînant la résiliation immédiate du contrat sans préavis et l'engagement de sa responsabilité civile et pénale.
        </p>
      </div>
    </div>
  );
};

export default DeliveryArticlesSection;
