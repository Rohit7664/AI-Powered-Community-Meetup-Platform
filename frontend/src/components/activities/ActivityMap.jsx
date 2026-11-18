import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ActivityMap = ({ activities = [], center = [28.6139, 77.2090], zoom = 12 }) => {
  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {activities.map((act) => {
          const coords = act.location?.coordinates;
          if (!coords || coords.length < 2) return null;
          // Coordinates are stored as [lng, lat], Leaflet needs [lat, lng]
          const position = [coords[1], coords[0]];

          return (
            <Marker key={act._id} position={position}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-sm text-slate-800">{act.title}</h4>
                  <p className="text-xs text-slate-500 mb-1">{act.location?.address}</p>
                  <p className="text-xs font-semibold text-primary-600">
                    {act.date} at {act.time}
                  </p>
                  <span className="inline-block mt-1 text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                    {act.participants?.length || 1}/{act.maxParticipants || 10} Participants
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ActivityMap;
