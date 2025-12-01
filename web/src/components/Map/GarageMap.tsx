import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Garage {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  rating?: {
    average: number;
    count: number;
  };
  isVerified?: boolean;
}

interface GarageMapProps {
  garages: Garage[];
  center?: [number, number]; // [latitude, longitude]
  zoom?: number;
  height?: string;
  showMarkerPopup?: boolean;
  onMarkerClick?: (garage: Garage) => void;
}

export default function GarageMap({
  garages,
  center = [48.8566, 2.3522], // Paris par défaut
  zoom = 12,
  height = '400px',
  showMarkerPopup = true,
  onMarkerClick,
}: GarageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger Leaflet dynamiquement
    const loadLeaflet = async () => {
      // Importer Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Importer Leaflet JS
      if (!(window as any).L) {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Erreur chargement Leaflet'));
          document.head.appendChild(script);
        }).then(() => {
          initializeMap();
        }).catch(err => {
          console.error('Erreur chargement Leaflet:', err);
        });
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !(window as any).L) return;

      const L = (window as any).L;

      // Initialiser la carte si elle n'existe pas encore
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

        // Ajouter la tuile OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
      } else {
        // Mettre à jour le centre si nécessaire
        mapInstanceRef.current.setView(center, zoom);
      }

      // Supprimer les anciens marqueurs
      markersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Calculer le centre basé sur tous les garages si aucun centre n'est fourni
      let mapCenter = center;
      if (garages.length > 0) {
        const validGarages = garages.filter(
          g => g.location?.coordinates && 
          g.location.coordinates.length === 2 && 
          g.location.coordinates[0] !== 0 && 
          g.location.coordinates[1] !== 0 &&
          !isNaN(g.location.coordinates[0]) &&
          !isNaN(g.location.coordinates[1])
        );
        
        if (validGarages.length > 0) {
          const avgLat = validGarages.reduce((sum, g) => sum + (g.location?.coordinates[1] || 0), 0) / validGarages.length;
          const avgLon = validGarages.reduce((sum, g) => sum + (g.location?.coordinates[0] || 0), 0) / validGarages.length;
          if (!center || (center[0] === 48.8566 && center[1] === 2.3522)) {
            mapCenter = [avgLat, avgLon];
          }
        }
      }

      // Mettre à jour le centre de la carte si nécessaire
      if (mapInstanceRef.current && mapCenter) {
        mapInstanceRef.current.setView(mapCenter, zoom);
      }

      // Ajouter les marqueurs pour chaque garage
      garages.forEach((garage) => {
        if (!garage.location || !garage.location.coordinates) return;
        
        // Vérifier que les coordonnées sont valides
        if (
          garage.location.coordinates.length !== 2 ||
          garage.location.coordinates[0] === 0 ||
          garage.location.coordinates[1] === 0 ||
          isNaN(garage.location.coordinates[0]) ||
          isNaN(garage.location.coordinates[1])
        ) {
          return;
        }

        const [longitude, latitude] = garage.location.coordinates;
        
        // Créer l'icône personnalisée
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: var(--color-rouge-600);
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-size: 18px;
                font-weight: bold;
              ">📍</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.marker([latitude, longitude], { icon })
          .addTo(mapInstanceRef.current);

        // Ajouter un popup avec les infos du garage
        if (showMarkerPopup) {
          const rating = garage.rating?.average ? `⭐ ${garage.rating.average.toFixed(1)} (${garage.rating.count})` : '';
          const verified = garage.isVerified ? '✓ Vérifié' : '';
          
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; color: var(--color-noir);">${garage.name}</h3>
              <p style="font-size: 12px; color: var(--color-noir-600); margin: 4px 0;">
                ${garage.address.street}<br/>
                ${garage.address.postalCode} ${garage.address.city}
              </p>
              ${rating ? `<p style="font-size: 11px; color: var(--color-rouge-600); margin: 4px 0;">${rating}</p>` : ''}
              ${verified ? `<p style="font-size: 11px; color: var(--color-rose-600); margin: 4px 0;">${verified}</p>` : ''}
              <button 
                onclick="window.location.href='/app/garage/${garage._id}'"
                style="
                  background-color: var(--color-rouge-600);
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  margin-top: 8px;
                  width: 100%;
                "
              >
                Voir le garage
              </button>
            </div>
          `);
        }

        // Gestion du clic sur le marqueur
        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(garage);
          } else {
            navigate(`/app/garage/${garage._id}`);
          }
        });

        markersRef.current.push(marker);
      });
    };

    loadLeaflet();

    // Nettoyage au démontage
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [garages, center, zoom, showMarkerPopup, onMarkerClick, navigate]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid var(--color-racine-200)',
      }}
      className="garage-map"
    />
  );
}

