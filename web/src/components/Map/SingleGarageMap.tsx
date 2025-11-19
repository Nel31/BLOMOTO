import { useEffect, useRef } from 'react';

interface SingleGarageMapProps {
  latitude: number;
  longitude: number;
  garageName: string;
  address?: string;
  height?: string;
}

export default function SingleGarageMap({
  latitude,
  longitude,
  garageName,
  address,
  height = '300px',
}: SingleGarageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      // Charger Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Charger Leaflet JS
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

      // Initialiser la carte
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 15);

        // Ajouter la tuile OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        // Ajouter un marqueur pour ce garage
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: var(--color-rouge-600);
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-size: 20px;
                font-weight: bold;
              ">📍</span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([latitude, longitude], { icon })
          .addTo(mapInstanceRef.current);

        // Ajouter un popup
        if (address) {
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; color: var(--color-noir);">${garageName}</h3>
              <p style="font-size: 12px; color: var(--color-noir-600); margin: 4px 0;">${address}</p>
            </div>
          `);
          marker.openPopup();
        }
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, garageName, address]);

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
      className="single-garage-map"
    />
  );
}

