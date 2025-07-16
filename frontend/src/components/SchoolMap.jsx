import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix missing marker icons in Leaflet (needed for Vite + React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function SchoolMap({ userCoords, schoolCoords, schoolName }) {
  const mapCenter = {
    lat: (userCoords.lat + schoolCoords.lat) / 2,
    lng: (userCoords.lng + schoolCoords.lng) / 2,
  };

  return (
    <div className="h-64 mt-4 rounded-xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        <Marker position={[userCoords.lat, userCoords.lng]}>
          <Popup>You are here</Popup>
        </Marker>

        {/* School Location Marker */}
        <Marker position={[schoolCoords.lat, schoolCoords.lng]}>
          <Popup>{schoolName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

SchoolMap.propTypes = {
  userCoords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  schoolCoords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  schoolName: PropTypes.string.isRequired,
};

export default SchoolMap;
