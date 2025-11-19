# 🗺️ Guide d'Intégration de la Carte

Ce guide explique comment intégrer les cartes dans l'application Promoto.

## 📦 Installation des Dépendances

Les cartes utilisent **Leaflet** (gratuit, open-source) qui est chargé dynamiquement. Aucune installation npm n'est nécessaire.

## 🎯 Composants Disponibles

### 1. `GarageMap` - Carte avec plusieurs garages
Affichage de plusieurs garages sur une carte avec des marqueurs cliquables.

### 2. `SingleGarageMap` - Carte pour un seul garage
Affichage de l'emplacement d'un garage spécifique.

## 🔧 Utilisation

### Dans GarageSearchPage (liste de garages)

```tsx
import GarageMap from '../components/Map/GarageMap';

// Dans votre composant
<GarageMap
  garages={garages}
  center={userLocation ? [userLocation.lat, userLocation.lng] : [48.8566, 2.3522]}
  zoom={userLocation ? 12 : 8}
  height="500px"
  showMarkerPopup={true}
  onMarkerClick={(garage) => navigate(`/app/garage/${garage._id}`)}
/>
```

### Dans GarageDetailPage (page d'un garage)

```tsx
import SingleGarageMap from '../components/Map/SingleGarageMap';

// Dans votre composant
{garage.location && garage.location.coordinates && (
  <SingleGarageMap
    latitude={garage.location.coordinates[1]}
    longitude={garage.location.coordinates[0]}
    garageName={garage.name}
    address={`${garage.address.street}, ${garage.address.postalCode} ${garage.address.city}`}
    height="400px"
  />
)}
```

## 🎨 Personnalisation

### Changer les couleurs des marqueurs
Modifiez `var(--color-rouge-600)` dans les composants pour utiliser d'autres couleurs.

### Changer le style de carte
Remplacez `'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'` par d'autres fournisseurs :
- **OpenStreetMap** (gratuit) : `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **CartoDB** (gratuit) : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
- **Google Maps** (payant) : Nécessite une clé API

## 📍 Format des Coordonnées

Les garages dans la base de données utilisent le format :
```javascript
location: {
  coordinates: [longitude, latitude] // Ordre important !
}
```

⚠️ **Attention** : Leaflet utilise `[latitude, longitude]`, donc inversez l'ordre lors de l'utilisation.

## 🚀 Avantages de Leaflet

- ✅ **Gratuit** et open-source
- ✅ Pas de clé API nécessaire
- ✅ Léger et rapide
- ✅ Personnalisable
- ✅ Compatible avec OpenStreetMap

## 🔒 Alternative : Google Maps

Si vous préférez Google Maps (nécessite une clé API) :

1. Installer : `npm install @react-google-maps/api`
2. Obtenir une clé API sur [Google Cloud Console](https://console.cloud.google.com/)
3. Créer un composant similaire avec `GoogleMap` et `Marker`

## 🔧 Géocodage Automatique des Adresses

Pour que les cartes affichent les vraies localisations, les garages doivent avoir des coordonnées GPS valides. Un système de géocodage automatique a été ajouté :

### Comment ça fonctionne

1. **Lors de la création/mise à jour d'un garage** : Si une adresse est fournie mais pas de coordonnées, le système géocode automatiquement l'adresse via l'API Nominatim (OpenStreetMap).

2. **Pour les garages existants** : Un script est disponible pour géocoder toutes les adresses existantes.

### Mettre à jour les coordonnées existantes

Exécutez le script de géocodage :

```bash
cd backend
node utils/updateGarageCoordinates.js
```

Ce script :
- Trouve tous les garages avec des coordonnées manquantes ou à [0, 0]
- Géocode leurs adresses via l'API Nominatim
- Met à jour les coordonnées dans la base de données
- Respecte un délai d'1 seconde entre chaque requête pour éviter de surcharger l'API

⚠️ **Note** : Nominatim est gratuit mais a des limites de taux. Pour un usage intensif, considérez utiliser un service payant comme Google Geocoding API.

### Vérifier les coordonnées

Les garages doivent avoir des coordonnées valides dans le format GeoJSON :
```javascript
location: {
  type: 'Point',
  coordinates: [longitude, latitude] // Ex: [2.3522, 48.8566] pour Paris
}
```

Les coordonnées [0, 0] sont ignorées par la carte car elles pointent vers l'océan Atlantique.

## 📝 Notes Importantes

- Les cartes sont chargées **dynamiquement** pour éviter de ralentir le chargement initial
- Les styles CSS de Leaflet sont injectés automatiquement
- Les marqueurs s'ajustent automatiquement selon le nombre de garages
- La carte se recentre automatiquement si vous changez les props `center` ou `zoom`
- **Les garages sans coordonnées valides ne s'affichent pas sur la carte**

