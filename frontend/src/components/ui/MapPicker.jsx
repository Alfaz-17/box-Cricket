import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SearchControl = ({ onResult }) => {
  const map = useMapEvents({});
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: false,
      retainZoomLevel: false,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      onResult(result.location.y, result.location.x);
    });

    return () => map.removeControl(searchControl);
  }, [map, onResult]);

  return null;
};

const MapPicker = ({ latitude, longitude, onLocationChange }) => {
  return (
    <MapContainer
      center={[latitude || 20.5937, longitude || 78.9629]}
      zoom={5}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SearchControl onResult={(lat, lng) => onLocationChange(lat, lng)} />
      {latitude && longitude && <Marker position={[latitude, longitude]} />}
    </MapContainer>
  );
};

export default MapPicker;
