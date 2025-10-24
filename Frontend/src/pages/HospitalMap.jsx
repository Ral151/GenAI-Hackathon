import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { TbCurrentLocation } from "react-icons/tb";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Custom icon using TbCurrentLocation
const currentLocationIcon = L.divIcon({
  html: renderToStaticMarkup(<TbCurrentLocation size={32} color="blue" />),
  className: "", // remove default leaflet styles
  iconSize: [32, 32],
  iconAnchor: [16, 16], // center the icon
});

// Comprehensive list of Hong Kong hospitals
const hongKongHospitals = [
  // Hong Kong Island
  {
    name: "Queen Mary Hospital",
    position: [22.27006, 114.13115],
    googleMapsUrl:
      "https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=hk&sa=X&geocode=KX8hxE7t_wM0MeC0uyJKQSGg&daddr=Queen+Mary+Hospital+Main+Block,+Pok+Fu+Lam+Rd,+Pok+Fu+Lam",
  },
  {
    name: "Pamela Youde Nethersole Eastern Hospital",
    position: [22.269777994078677, 114.23626529487628],
    googleMapsUrl: "https://maps.app.goo.gl/K3vK9Dy4FHBaSyrg8",
  },
  {
    name: "Ruttonjee Hospital",
    position: [22.276058176595654, 114.17538855254838],
    googleMapsUrl: "https://maps.app.goo.gl/42CF2aM3hcSX7MQh9",
  },
  {
    name: "Tang Shiu Kin Hospital",
    position: [22.275882295954126, 114.17773012371244],
    googleMapsUrl: "https://maps.app.goo.gl/kFPn3u2f9tp9ExZt6",
  },
  {
    name: "Hong Kong Sanatorium & Hospital",
    position: [22.26936132270723, 114.18299218507327],
    googleMapsUrl: "https://maps.app.goo.gl/jhQXDXcxZWirm1e96",
  },
  {
    name: "St. Paul's Hospital",
    position: [22.278805446130562, 114.18811738111766],
    googleMapsUrl: "https://maps.app.goo.gl/xcDPpBvwHqwmTxx6A",
  },
  {
    name: "Gleneagles Hong Kong Hospital",
    position: [22.25182535587995, 114.176364408368],
    googleMapsUrl: "https://maps.app.goo.gl/D5oG4DX9mAE7wVxSA",
  },

  // Kowloon
  {
    name: "Queen Elizabeth Hospital",
    position: [22.308865024740328, 114.1747441525494],
    googleMapsUrl: "https://maps.app.goo.gl/jwMqNNziP4vpLDeW9",
  },
  {
    name: "United Christian Hospital",
    position: [22.32364562417945, 114.22756459487792],
    googleMapsUrl: "https://maps.app.goo.gl/KHTmxwfVeV1bSeW4A",
  },
  {
    name: "Kwong Wah Hospital",
    position: [22.315455970243363, 114.17235784661698],
    googleMapsUrl: "https://maps.app.goo.gl/YJ1h9FwgsAXi5PVT8",
  },
  {
    name: "Caritas Medical Centre",
    position: [22.34069435512806, 114.15240805592802],
    googleMapsUrl: "https://maps.app.goo.gl/QKzGF2f3ZeKwxJiW6",
  },
  {
    name: "Hong Kong Baptist Hospital",
    position: [22.34007572203855, 114.17981257953494],
    googleMapsUrl: "https://maps.app.goo.gl/Rce48gkdt9NH38Au9",
  },
  {
    name: "St. Teresa's Hospital",
    position: [22.327868733473125, 114.1847171633113],
    googleMapsUrl: "https://maps.app.goo.gl/wREKGE51pMSrp3qp7",
  },
  {
    name: "Princess Margaret Hospital",
    position: [22.34056709886847, 114.13437919434544],
    googleMapsUrl: "https://maps.app.goo.gl/8hEpGP4ezAYrdJaP6",
  },

  // New Territories
  {
    name: "Prince of Wales Hospital",
    position: [22.378388104208017, 114.2023908906441],
    googleMapsUrl: "https://maps.app.goo.gl/d39CrAiDCkLdYDaj6",
  },
  {
    name: "Tuen Mun Hospital",
    position: [22.407644679822702, 113.97624789302955],
    googleMapsUrl: "https://maps.app.goo.gl/SLbj3eLdui73wogX9",
  },
  {
    name: "North District Hospital",
    position: [22.497028277482972, 114.12463715070416],
    googleMapsUrl: "https://maps.app.goo.gl/Ww6WeUbuNLBjd4Lk7",
  },
  {
    name: "Ping Shan Tin Shui Wai Hospital",
    position: [22.458582161040546, 113.99585592371822],
    googleMapsUrl: "https://maps.app.goo.gl/saRDCQe6qQUpCwVv7",
  },
  {
    name: "Alice Ho Miu Ling Nethersole Hospital",
    position: [22.45887015143679, 114.1747130507029],
    googleMapsUrl: "https://maps.app.goo.gl/4EG2zxxJvLXfh6h67",
  },
  {
    name: "Pok Oi Hospital",
    position: [22.445691784515887, 114.04139862795363],
    googleMapsUrl: "https://maps.app.goo.gl/MNwu7bCCSFjfQCyM9",
  },
  {
    name: "Yan Chai Hospital",
    position: [22.370146172759284, 114.11939916419236],
    googleMapsUrl: "https://maps.app.goo.gl/sSG4L6KV6HeSCJZUA",
  },

  // Islands
  {
    name: "North Lantau Hospital",
    position: [22.28210750128454, 113.93918486418947],
    googleMapsUrl: "https://maps.app.goo.gl/6yQKr7RChQaJES2Z8",
  },
];

// Custom component to track user location and pan map to it
function LocateUser() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 13);
    });
  }, [map]);

  return null;
}

export default function HospitalMap() {
  const [userPosition, setUserPosition] = useState(null);
  const [hospitals, setHospitals] = useState(hongKongHospitals);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = [position.coords.latitude, position.coords.longitude];
        setUserPosition(userPos);

        // Optional: Sort hospitals by distance to user
        const sortedHospitals = [...hongKongHospitals].sort((a, b) => {
          const distA = getDistance(userPos, a.position);
          const distB = getDistance(userPos, b.position);
          return distA - distB;
        });

        setHospitals(sortedHospitals);
      },
      () => {
        console.warn("Geolocation permission denied or unavailable");
      }
    );
  }, []);

  // Helper function to calculate distance between two coordinates (simplified)
  const getDistance = (pos1, pos2) => {
    const [lat1, lon1] = pos1;
    const [lat2, lon2] = pos2;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="flex flex-col items-center h-[70vh] md:h-[80vh] lg:h-[4 0rem]">
      <h2 className="text-2xl font-bold mb-4">Hong Kong Hospitals Map</h2>
      <p className="text-sm text-gray-600 mb-4">
        Showing {hospitals.length} hospitals across Hong Kong
      </p>

      <MapContainer
        center={userPosition || [22.3193, 114.1694]} // Centered on Hong Kong
        zoom={11}
        style={{ height: "78vh", width: "90vw", maxWidth: 960 }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userPosition && (
          <Marker position={userPosition} icon={currentLocationIcon}>
            <Popup>
              <div className="text-center">
                <strong>📍 Your Location</strong>
                <br />
                <span className="text-sm">
                  {userPosition[0].toFixed(4)}, {userPosition[1].toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {hospitals.map((hospital, index) => (
          <Marker
            key={`${hospital.name}-${index}`}
            position={hospital.position}
          >
            <Popup>
              <div className="min-w-[200px]">
                <strong className="text-lg">{hospital.name}</strong>
                <div className="mt-2">
                  <a
                    href={hospital.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    View on Google Maps
                  </a>
                </div>
                {userPosition && (
                  <div className="mt-2 text-xs text-gray-600">
                    Distance:{" "}
                    {getDistance(userPosition, hospital.position).toFixed(1)} km
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <LocateUser />
      </MapContainer>
    </div>
  );
}
