import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const hospitals = [
  { name: "Queen Mary Hospital", position: [22.2833, 114.1317], googleMapsUrl: "https://goo.gl/maps/XXXXXXXX" },
  { name: "Pamela Youde Nethersole Eastern Hospital", position: [22.2839, 114.2167], googleMapsUrl: "https://goo.gl/maps/YYYYYYYY" }
];

// Custom component to track user location and pan map to it
function LocateUser() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.locate().on('locationfound', function (e) {
      map.flyTo(e.latlng, 13);
    });

  }, [map]);

  return null;
}

export default function HospitalMap() {
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        console.warn("Geolocation permission denied or unavailable");
      }
    );
  }, []);

  return (
    <div className="flex flex-col items-center  h-[70vh] md:h-[80vh] lg:h-[90rem]">
      <h2 className="text-2xl font-bold mb-6">Hospital Map</h2>
      <MapContainer
        center={userPosition || [22.3, 114.17]}
        zoom={12}
        style={{ height: "78vh", width: "90vw", maxWidth: 960 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userPosition && (
          <Marker position={userPosition}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {hospitals.map((hospital) => (
          <Marker key={hospital.name} position={hospital.position}>
            <Popup>
              <div>
                <strong>{hospital.name}</strong>
                <br />
                <a
                  href={hospital.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View on Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
        <LocateUser />
      </MapContainer>
    </div>
  );
}
