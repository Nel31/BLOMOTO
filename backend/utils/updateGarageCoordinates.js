// Script pour mettre à jour les coordonnées des garages existants
// À exécuter une fois pour géocoder toutes les adresses

const Garage = require('../models/Garage');
const { geocodeAddress } = require('./geocoding');

const updateAllGarageCoordinates = async () => {
  try {
    console.log('Début de la mise à jour des coordonnées des garages...');
    
    const garages = await Garage.find({
      $or: [
        { 'location.coordinates.0': { $in: [0, null, undefined] } },
        { 'location.coordinates.1': { $in: [0, null, undefined] } },
      ],
    });

    console.log(`${garages.length} garages à mettre à jour.`);

    let updated = 0;
    let failed = 0;

    for (const garage of garages) {
      try {
        if (!garage.address || !garage.address.street || !garage.address.city) {
          console.log(`Garage ${garage._id} (${garage.name}) : adresse incomplète`);
          console.log(`  Adresse actuelle:`, JSON.stringify(garage.address, null, 2));
          continue;
        }

        console.log(`\nGéocodage de ${garage.name}...`);
        console.log(`  Adresse: ${garage.address.street}, ${garage.address.postalCode} ${garage.address.city}`);
        
        const geocoded = await geocodeAddress(garage.address);

        if (geocoded && geocoded.coordinates) {
          garage.location = {
            type: 'Point',
            coordinates: geocoded.coordinates,
          };
          await garage.save();
          console.log(`✓ ${garage.name} : coordonnées mises à jour [${geocoded.coordinates[0]}, ${geocoded.coordinates[1]}]`);
          updated++;
          
          // Attendre un peu pour éviter de surcharger l'API Nominatim
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`✗ ${garage.name} : géocodage échoué - aucune coordonnée trouvée`);
          console.log(`  Essayez de vérifier l'adresse: ${garage.address.street}, ${garage.address.postalCode} ${garage.address.city}`);
          failed++;
        }
      } catch (error) {
        console.error(`✗ Erreur pour ${garage.name}:`, error.message);
        console.error(`  Stack:`, error.stack);
        failed++;
      }
    }

    console.log(`\nTerminé ! ${updated} garages mis à jour, ${failed} échecs.`);
  } catch (error) {
    console.error('Erreur globale:', error);
  }
};

// Exécuter si appelé directement
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/promoto')
    .then(() => {
      console.log('Connecté à MongoDB');
      return updateAllGarageCoordinates();
    })
    .then(() => {
      console.log('Déconnexion...');
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur:', error);
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = { updateAllGarageCoordinates };

