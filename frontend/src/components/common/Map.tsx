"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "@/lib/leaflet-icon";

type Position = [number, number];

function LocateUser({ setPosition }: { setPosition: (pos: Position) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos: Position = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];

        setPosition(userPos);
        map.setView(userPos, 15); // zoom to user
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true , timeout : 15000 , maximumAge:0  }
    );
  }, [map, setPosition]);

  return null;
}

export default function Map() {
  const [userPosition, setUserPosition] = useState<Position | null>(null);

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // India fallback
      zoom={5}
      className="h-[400px] w-full rounded-xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocateUser setPosition={setUserPosition} />

      {userPosition && (
        <Marker position={userPosition}>
          <Popup>📍 You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
