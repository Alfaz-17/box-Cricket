import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

const BoxMap = ({ lat, lng, name }) => {
  return (
    <div className="h-64 w-full rounded-lg overflow-hidden mb-3 relative z-10">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="h-full w-full"
        scrollWheelZoom={false} // optional
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
export default BoxMap
