const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère un PDF de devis
 */
exports.generateQuotePDF = async (quote, garage, client) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Créer le dossier uploads/quotes s'il n'existe pas
          const uploadsDir = path.join(__dirname, '..', 'uploads');
          const quotesDir = path.join(uploadsDir, 'quotes');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          if (!fs.existsSync(quotesDir)) {
            fs.mkdirSync(quotesDir, { recursive: true });
          }
          
          // Sauvegarder le PDF localement
          const fileName = `${quote.quoteNumber}.pdf`;
          const filePath = path.join(quotesDir, fileName);
          fs.writeFileSync(filePath, pdfBuffer);
          
          // Retourner l'URL locale
          const url = `/uploads/quotes/${fileName}`;
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
      doc.on('error', reject);

      // En-tête
      doc
        .fontSize(20)
        .fillColor('#dc2626')
        .text('DEVIS', { align: 'center' })
        .moveDown();

      // Informations du garage
      doc
        .fontSize(14)
        .fillColor('#000000')
        .text(garage.name, { align: 'left' })
        .fontSize(10)
        .text(garage.address.street)
        .text(`${garage.address.postalCode} ${garage.address.city}`)
        .text(garage.address.country);
      
      if (garage.phone) {
        doc.text(`Tél: ${garage.phone}`);
      }
      if (garage.email) {
        doc.text(`Email: ${garage.email}`);
      }

      doc.moveDown();

      // Informations du client
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Client:', { continued: true })
        .text(client.name, { align: 'left' });
      
      if (client.email) {
        doc.text(`Email: ${client.email}`);
      }
      if (client.phone) {
        doc.text(`Tél: ${client.phone}`);
      }

      doc.moveDown();

      // Informations du devis
      doc
        .fontSize(10)
        .text(`N° Devis: ${quote.quoteNumber}`)
        .text(`Date: ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}`)
        .text(`Valide jusqu'au: ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}`)
        .text(`Statut: ${getStatusLabel(quote.status)}`);

      doc.moveDown(2);

      // Tableau des articles
      const tableTop = doc.y;
      const itemHeight = 30;
      let currentY = tableTop;

      // En-tête du tableau
      doc
        .fontSize(10)
        .fillColor('#ffffff')
        .rect(50, currentY, 500, 25)
        .fill('#dc2626')
        .fillColor('#ffffff')
        .text('Description', 55, currentY + 7, { width: 250 })
        .text('Qté', 310, currentY + 7, { width: 50, align: 'right' })
        .text('Prix unit.', 365, currentY + 7, { width: 80, align: 'right' })
        .text('Total', 450, currentY + 7, { width: 90, align: 'right' });

      currentY += 25;

      // Articles
      doc.fillColor('#000000');
      quote.items.forEach((item, index) => {
        const y = currentY + (index * itemHeight);
        
        // Fond alterné
        if (index % 2 === 0) {
          doc
            .fillColor('#f5f5f5')
            .rect(50, y, 500, itemHeight)
            .fill();
        }

        doc
          .fillColor('#000000')
          .fontSize(9)
          .text(item.description, 55, y + 10, { width: 250 })
          .text(item.quantity.toString(), 310, y + 10, { width: 50, align: 'right' })
          .text(`${formatCurrency(item.unitPrice)}`, 365, y + 10, { width: 80, align: 'right' })
          .text(`${formatCurrency(item.total)}`, 450, y + 10, { width: 90, align: 'right' });
      });

      currentY += quote.items.length * itemHeight;

      // Totaux
      doc
        .fontSize(10)
        .fillColor('#000000')
        .text('Sous-total HT:', 350, currentY + 20, { width: 100, align: 'right' })
        .text(`${formatCurrency(quote.subtotal)}`, 450, currentY + 20, { width: 90, align: 'right' });

      if (quote.tax > 0) {
        doc
          .text(`TVA (${quote.taxRate}%):`, 350, currentY + 40, { width: 100, align: 'right' })
          .text(`${formatCurrency(quote.tax)}`, 450, currentY + 40, { width: 90, align: 'right' });
        currentY += 20;
      }

      doc
        .fontSize(12)
        .fillColor('#dc2626')
        .text('TOTAL TTC:', 350, currentY + 50, { width: 100, align: 'right', bold: true })
        .text(`${formatCurrency(quote.total)}`, 450, currentY + 50, { width: 90, align: 'right', bold: true });

      // Notes
      if (quote.notes) {
        doc
          .moveDown(3)
          .fontSize(9)
          .fillColor('#666666')
          .text('Notes:', 50, doc.y)
          .fillColor('#000000')
          .text(quote.notes, 50, doc.y + 15, { width: 500 });
      }

      // Pied de page
      doc
        .fontSize(8)
        .fillColor('#666666')
        .text(
          'Ce devis est valable jusqu\'à la date indiquée ci-dessus.',
          50,
          doc.page.height - 50,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Génère un PDF de facture
 */
exports.generateInvoicePDF = async (invoice, garage, client) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Créer le dossier uploads/invoices s'il n'existe pas
          const uploadsDir = path.join(__dirname, '..', 'uploads');
          const invoicesDir = path.join(uploadsDir, 'invoices');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
          }
          
          // Sauvegarder le PDF localement
          const fileName = `${invoice.invoiceNumber}.pdf`;
          const filePath = path.join(invoicesDir, fileName);
          fs.writeFileSync(filePath, pdfBuffer);
          
          // Retourner l'URL locale
          const url = `/uploads/invoices/${fileName}`;
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
      doc.on('error', reject);

      // En-tête
      doc
        .fontSize(20)
        .fillColor('#dc2626')
        .text('FACTURE', { align: 'center' })
        .moveDown();

      // Informations du garage
      doc
        .fontSize(14)
        .fillColor('#000000')
        .text(garage.name, { align: 'left' })
        .fontSize(10)
        .text(garage.address.street)
        .text(`${garage.address.postalCode} ${garage.address.city}`)
        .text(garage.address.country);
      
      if (garage.phone) {
        doc.text(`Tél: ${garage.phone}`);
      }
      if (garage.email) {
        doc.text(`Email: ${garage.email}`);
      }

      doc.moveDown();

      // Informations du client
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Client:', { continued: true })
        .text(client.name, { align: 'left' });
      
      if (client.email) {
        doc.text(`Email: ${client.email}`);
      }
      if (client.phone) {
        doc.text(`Tél: ${client.phone}`);
      }

      doc.moveDown();

      // Informations de la facture
      doc
        .fontSize(10)
        .text(`N° Facture: ${invoice.invoiceNumber}`)
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`)
        .text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`)
        .text(`Statut: Payé`);

      if (invoice.quoteId) {
        doc.text(`Référence devis: ${invoice.quoteId}`);
      }

      doc.moveDown(2);

      // Tableau des articles
      const tableTop = doc.y;
      const itemHeight = 30;
      let currentY = tableTop;

      // En-tête du tableau
      doc
        .fontSize(10)
        .fillColor('#ffffff')
        .rect(50, currentY, 500, 25)
        .fill('#dc2626')
        .fillColor('#ffffff')
        .text('Description', 55, currentY + 7, { width: 250 })
        .text('Qté', 310, currentY + 7, { width: 50, align: 'right' })
        .text('Prix unit.', 365, currentY + 7, { width: 80, align: 'right' })
        .text('Total', 450, currentY + 7, { width: 90, align: 'right' });

      currentY += 25;

      // Articles
      doc.fillColor('#000000');
      invoice.items.forEach((item, index) => {
        const y = currentY + (index * itemHeight);
        
        // Fond alterné
        if (index % 2 === 0) {
          doc
            .fillColor('#f5f5f5')
            .rect(50, y, 500, itemHeight)
            .fill();
        }

        doc
          .fillColor('#000000')
          .fontSize(9)
          .text(item.description, 55, y + 10, { width: 250 })
          .text(item.quantity.toString(), 310, y + 10, { width: 50, align: 'right' })
          .text(`${formatCurrency(item.unitPrice)}`, 365, y + 10, { width: 80, align: 'right' })
          .text(`${formatCurrency(item.total)}`, 450, y + 10, { width: 90, align: 'right' });
      });

      currentY += invoice.items.length * itemHeight;

      // Totaux
      doc
        .fontSize(10)
        .fillColor('#000000')
        .text('Sous-total HT:', 350, currentY + 20, { width: 100, align: 'right' })
        .text(`${formatCurrency(invoice.subtotal)}`, 450, currentY + 20, { width: 90, align: 'right' });

      if (invoice.tax > 0) {
        doc
          .text(`TVA (${invoice.taxRate}%):`, 350, currentY + 40, { width: 100, align: 'right' })
          .text(`${formatCurrency(invoice.tax)}`, 450, currentY + 40, { width: 90, align: 'right' });
        currentY += 20;
      }

      doc
        .fontSize(12)
        .fillColor('#dc2626')
        .text('TOTAL TTC:', 350, currentY + 50, { width: 100, align: 'right', bold: true })
        .text(`${formatCurrency(invoice.total)}`, 450, currentY + 50, { width: 90, align: 'right', bold: true });

      // Montant payé
      if (invoice.paidAmount > 0) {
        doc
          .fontSize(10)
          .fillColor('#000000')
          .text('Montant payé:', 350, currentY + 70, { width: 100, align: 'right' })
          .text(`${formatCurrency(invoice.paidAmount)}`, 450, currentY + 70, { width: 90, align: 'right' });
        
        const remaining = invoice.total - invoice.paidAmount;
        if (remaining > 0) {
          doc
            .fontSize(11)
            .fillColor('#dc2626')
            .text('Reste à payer:', 350, currentY + 90, { width: 100, align: 'right', bold: true })
            .text(`${formatCurrency(remaining)}`, 450, currentY + 90, { width: 90, align: 'right', bold: true });
        }
      }

      // Notes
      if (invoice.notes) {
        doc
          .moveDown(3)
          .fontSize(9)
          .fillColor('#666666')
          .text('Notes:', 50, doc.y)
          .fillColor('#000000')
          .text(invoice.notes, 50, doc.y + 15, { width: 500 });
      }

      // Tampon "PAYÉ" avec le nom du garage (positionné en bas à droite)
      const stampWidth = 180;
      const stampHeight = 100;
      const stampX = doc.page.width - stampWidth - 50;
      const stampY = doc.page.height - stampHeight - 50;
      
      // Fond du tampon (rectangle arrondi avec bordure)
      doc
        .save()
        .translate(stampX + stampWidth / 2, stampY + stampHeight / 2)
        .rotate(-20) // Rotation pour effet de tampon authentique
        .fillColor('#10b981') // Vert pour "PAYÉ"
        .roundedRect(-stampWidth / 2, -stampHeight / 2, stampWidth, stampHeight, 15)
        .fill()
        // Bordure pour effet de tampon
        .strokeColor('#0d9668')
        .lineWidth(2)
        .roundedRect(-stampWidth / 2, -stampHeight / 2, stampWidth, stampHeight, 15)
        .stroke()
        .fillColor('#ffffff')
        .fontSize(32)
        .font('Helvetica-Bold')
        .text('PAYÉ', 0, -25, {
          align: 'center',
          width: stampWidth
        })
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(garage.name, 0, 15, {
          align: 'center',
          width: stampWidth
        })
        .restore();

      // Pied de page
      doc
        .fontSize(8)
        .fillColor('#666666')
        .text(
          'Merci pour votre confiance !',
          50,
          doc.page.height - 50,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Fonctions utilitaires
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function getStatusLabel(status) {
  const labels = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    accepted: 'Accepté',
    rejected: 'Refusé',
    expired: 'Expiré',
  };
  return labels[status] || status;
}

function getInvoiceStatusLabel(status) {
  const labels = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
  };
  return labels[status] || status;
}

