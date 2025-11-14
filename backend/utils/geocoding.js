// Utilitaire pour géocoder une adresse en coordonnées GPS
// Utilise l'API gratuite Nominatim d'OpenStreetMap

const https = require('https');

const geocodeAddress = async (address) => {
  try {
    const { street, city, postalCode, country = 'France' } = address;
    
    // Nettoyer et construire l'adresse complète
    const cleanStreet = (street || '').trim();
    const cleanCity = (city || '').trim();
    const cleanPostalCode = (postalCode || '').trim();
    
    // Si l'adresse est incomplète, retourner null
    if (!cleanStreet || !cleanCity) {
      console.error('Adresse incomplète pour géocodage');
      return null;
    }
    
    // Construire différentes variantes de l'adresse pour améliorer les chances de succès
    const addressVariants = [
      `${cleanStreet}, ${cleanPostalCode} ${cleanCity}, ${country}`,
      `${cleanStreet}, ${cleanCity}, ${country}`,
      `${cleanPostalCode} ${cleanCity}, ${country}`,
      `${cleanCity}, ${country}`
    ];
    
    // Essayer chaque variante jusqu'à en trouver une qui fonctionne
    for (const fullAddress of addressVariants) {
      const encodedAddress = encodeURIComponent(fullAddress);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;
      
      try {
        const result = await new Promise((resolve, reject) => {
          const req = https.get(url, {
            headers: {
              'User-Agent': 'Promoto-App/1.0'
            },
            timeout: 10000
          }, (res) => {
            let data = '';
            
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`));
              return;
            }
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              try {
                const results = JSON.parse(data);
                
                if (results && results.length > 0) {
                  const result = results[0];
                  // Vérifier que les coordonnées sont valides
                  const lon = parseFloat(result.lon);
                  const lat = parseFloat(result.lat);
                  
                  if (!isNaN(lon) && !isNaN(lat) && lon !== 0 && lat !== 0) {
                    const coordinates = [lon, lat];
                    resolve({
                      longitude: lon,
                      latitude: lat,
                      coordinates,
                      display_name: result.display_name
                    });
                  } else {
                    resolve(null);
                  }
                } else {
                  resolve(null);
                }
              } catch (error) {
                reject(error);
              }
            });
          });
          
          req.on('error', (error) => {
            reject(error);
          });
          
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
        });
        
        if (result) {
          return result;
        }
      } catch (error) {
        // Continuer avec la variante suivante
        continue;
      }
    }
    
    // Aucune variante n'a fonctionné
    return null;
  } catch (error) {
    console.error('Erreur géocodage:', error.message);
    return null;
  }
};

module.exports = { geocodeAddress };

