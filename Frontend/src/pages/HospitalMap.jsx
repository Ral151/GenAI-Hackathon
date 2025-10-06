import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const hospitals = [
  { name: "Queen Mary Hospital", position: [22.2833, 114.1317] },
  { name: "Pamela Youde Nethersole Eastern Hospital", position: [22.2839, 114.2167] }
];

export default function HospitalMap() {
  return (
    <div className="flex flex-col items-center py-10 h-[70vh]">
      <h2 className="text-2xl font-bold mb-6">Hospital Map</h2>
      <MapContainer center={[22.3, 114.17]} zoom={12} style={{ height: "60vh", width: "90vw", maxWidth: 960 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {hospitals.map(hospital => (
          <Marker key={hospital.name} position={hospital.position}>
            <Popup>{hospital.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
