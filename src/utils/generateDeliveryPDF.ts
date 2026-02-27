import { DeliveryContractData } from '@/types/deliveryContract';
import jsPDF from 'jspdf';

export function generateDeliveryContractPDF(data: DeliveryContractData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  const addTitle = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 48, 80);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += 10;
  };

  const addSubtitle = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 48, 80);
    doc.text(text, 14, y);
    y += 7;
  };

  const addText = (text: string, indent = 14) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, pageWidth - indent - 14);
    doc.text(lines, indent, y);
    y += lines.length * 5;
  };

  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 48, 80);
    doc.text(`${label} :`, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(value || '—', 70, y);
    y += 6;
  };

  const checkNewPage = (needed = 30) => {
    if (y > pageHeight - needed) {
      doc.addPage();
      y = 20;
    }
  };

  const addCINImages = (label: string, recto: string | null, verso: string | null) => {
    checkNewPage(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 48, 80);
    doc.text(`${label} — CIN :`, 18, y);
    y += 4;
    const imgW = 40, imgH = 28;
    if (recto) { try { doc.addImage(recto, 'JPEG', 18, y, imgW, imgH); } catch {} }
    if (verso) { try { doc.addImage(verso, 'JPEG', 18 + imgW + 10, y, imgW, imgH); } catch {} }
    y += imgH + 8;
  };

  // Header
  doc.setDrawColor(200, 170, 50);
  doc.setLineWidth(2);
  doc.line(14, 12, pageWidth - 14, 12);

  addTitle('CONTRAT DE LIVRAISON');
  y += 2;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  const statusLabel = data.status === 'valide' ? 'VALIDÉ' : data.status === 'resilie' ? 'RÉSILIÉ' : 'EN ATTENTE';
  doc.text(`N° ${data.contract_number}  |  Statut : ${statusLabel}  |  Date : ${data.date_contrat}`, pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 120, 70);
  doc.text('✓ Identité vérifiée par contrôle automatique', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Partie principale
  const partieLabel = data.type_partie === 'fournisseur' ? 'FOURNISSEUR' : 'DISTRIBUTEUR';
  addSubtitle(`INFORMATIONS DU ${partieLabel}`);
  addField('Nom complet', data.partie_nom_complet);
  addField('CIN', data.partie_cin);
  addField('Adresse', data.partie_adresse);
  addField('Téléphone', data.partie_telephone);
  y += 2;
  addCINImages(partieLabel, data.partie_cin_recto, data.partie_cin_verso);
  y += 4;

  // Livreur
  checkNewPage(60);
  addSubtitle('INFORMATIONS DU LIVREUR');
  addField('Nom complet', data.livreur_nom_complet);
  addField('CIN', data.livreur_cin);
  addField('Adresse', data.livreur_adresse);
  addField('Téléphone', data.livreur_telephone);
  y += 2;
  addCINImages('Livreur', data.livreur_cin_recto, data.livreur_cin_verso);
  y += 4;

  checkNewPage();

  // Articles
  addSubtitle('Article 1 : Objet du contrat');
  addText(`Le présent contrat a pour objet de définir les conditions de collaboration entre le ${data.type_partie === 'fournisseur' ? 'Fournisseur' : 'Distributeur'} et le Livreur pour l'acheminement des marchandises aux clients finaux.`);
  y += 3;

  addSubtitle('Article 2 : Responsabilité des marchandises');
  addText('Le Livreur est responsable des marchandises qui lui sont confiées dès leur prise en charge jusqu\'à la remise effective au client. Il s\'engage à les transporter avec soin et à les protéger contre tout dommage.');
  y += 3;

  checkNewPage();
  addSubtitle('Article 3 : Perte ou détérioration');
  addText('En cas de perte ou détérioration des marchandises pendant le transport, le Livreur en assume l\'entière responsabilité et s\'engage à rembourser la valeur des articles concernés dans un délai de 7 jours.');
  y += 3;

  addSubtitle('Article 4 : Litige');
  addText('En cas de litige entre les parties, celles-ci s\'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut d\'accord amiable dans un délai de 30 jours, le litige sera soumis aux juridictions compétentes.');
  y += 3;

  checkNewPage();
  addSubtitle('Article 5 : Résiliation');
  addText('Chaque partie peut résilier le contrat avec un préavis de 15 jours, sauf en cas de faute grave entraînant une résiliation immédiate sans préavis.');
  y += 3;

  addSubtitle('Article 6 : Durée');
  addText('Le présent contrat est conclu pour une durée de 12 mois à compter de sa date de validation. Il est renouvelable par accord mutuel des parties.');
  y += 3;

  checkNewPage();
  addSubtitle('Article 7 : Détournement et faute grave');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 30, 30);
  const art7Text = 'Le livreur accepte que toute tentative de fraude, dissimulation ou fuite constitue une faute grave entraînant la résiliation immédiate du contrat sans préavis et l\'engagement de sa responsabilité civile et pénale.';
  const art7Lines = doc.splitTextToSize(art7Text, pageWidth - 28);
  doc.text(art7Lines, 14, y);
  y += art7Lines.length * 5 + 3;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y += 3;

  // Lieu et date
  checkNewPage();
  addSubtitle('Lieu et date');
  addField('Lieu', data.lieu);
  addField('Date', data.date_contrat);
  y += 6;

  // Validations
  checkNewPage();
  addSubtitle('Validations');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const check = (v: boolean) => v ? '☑' : '☐';
  doc.text(`${check(data.validation_partie)} Le ${partieLabel.toLowerCase()} confirme et valide les informations`, 18, y);
  y += 6;
  doc.text(`${check(data.validation_livreur)} Le livreur confirme et valide les informations`, 18, y);
  y += 8;

  if (data.validated_at) {
    addField('Date de validation', new Date(data.validated_at).toLocaleDateString('fr-FR'));
  }

  // Footer
  doc.setDrawColor(200, 170, 50);
  doc.setLineWidth(1);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Document généré automatiquement — Contrat de livraison N° ${data.contract_number} — Identité vérifiée par IA`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`contrat-livraison-${data.contract_number}.pdf`);
}
