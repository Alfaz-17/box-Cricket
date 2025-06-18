import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SearchControl = ({ onResult }) => {
  const map = useMapEvents({});

  useEffect(() => {
    // Prevent adding control more than once
    if (map._searchControlAdded) return;
    map._searchControlAdded = true;

    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: false,
      retainZoomLevel: false,
    });

    map.addControl(searchControl);

    // Add custom styling
    const style = document.createElement("style");
    style.innerHTML = `
      .leaflet-control-geosearch .glass {
        background-color: #f3f4f6 !important; /* Tailwind bg-base-200 */
        font-size: 16px !important; /* Tailwind text-base */
        color: #1f2937 !important; /* Tailwind text-gray-800 */
        border-radius: 0.5rem !important; /* Tailwind rounded */
        padding: 0.5rem 1rem !important;
        border: 1px solid #d1d5db !important; /* Tailwind border-gray-300 */
      }

      .leaflet-control-geosearch .results {
        background-color: #f3f4f6 !important;
        font-size: 16px !important;
        border: 1px solid #d1d5db !important;
        border-radius: 0.5rem !important;
      }

      .leaflet-control-geosearch .results > * {
        background-color: #f3f4f6 !important;
        color: #1f2937 !important;
        padding: 0.5rem 1rem;
        cursor: pointer;
      }

      .leaflet-control-geosearch .results > *:hover {
        background-color: #e5e7eb !important; /* Tailwind bg-gray-200 */
      }
    `;
    document.head.appendChild(style);

    // Event listener
    map.on("geosearch/showlocation", (result) => {
      onResult(result.location.y, result.location.x);
    });

    // Cleanup
    return () => {
      map.removeControl(searchControl);
      document.head.removeChild(style);
      map._searchControlAdded = false;
    };
  }, [map, onResult]);

  return null;
};

const MapPicker = ({ latitude, longitude, onLocationChange }) => {
  return (
    <MapContainer
      center={[latitude || 20.5937, longitude || 78.9629]}
      zoom={5}
      style={{ height: "300px", width: "100%" }}
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
