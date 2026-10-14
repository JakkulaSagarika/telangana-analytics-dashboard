import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

function MapFitBounds({ geojson }) {
  const map = useMap();

  useEffect(() => {
    if (
      geojson &&
      geojson.features &&
      geojson.features.length > 0
    ) {
      const layer = window.L.geoJSON(geojson);

      map.fitBounds(layer.getBounds(), {
        padding: [20, 20],
      });
    }
  }, [geojson, map]);

  return null;
}

export default function AgricultureMap() {
  const navigate = useNavigate();

  const [districts, setDistricts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/agriculture/districts/")
      .then((res) => {
        setDistricts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Agriculture map error:",
          err
        );
        setLoading(false);
      });
  }, []);

  const getDistrictName = (feature) => {
  const properties = feature.properties || {};

  return (
    properties.DISTRICT_N ||
    properties.District ||
    properties.district ||
    properties.DISTRICT ||
    properties.NAME ||
    properties.Name ||
    properties.name ||
    "Unknown"
  );
};

  const normalizeDistrictName = (name) => {
    return name
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .trim();
  };

  const districtStyle = () => ({
    fillColor: "#9FC7A5",
    weight: 1.5,
    opacity: 1,
    color: "#1F4F39",
    fillOpacity: 0.75,
  });

  const onEachDistrict = (
    feature,
    layer
  ) => {
    const rawName =
      getDistrictName(feature);

    const districtName =
      normalizeDistrictName(rawName);

    layer.bindTooltip(
      districtName,
      {
        permanent: false,
        direction: "center",
        className:
          "agriculture-district-tooltip",
      }
    );

    layer.on({
      mouseover: (event) => {
        event.target.setStyle({
          fillColor: "#4E8F68",
          fillOpacity: 0.9,
          weight: 2.5,
          color: "#1F4F39",
        });

        event.target.bringToFront();
      },

      mouseout: (event) => {
        event.target.setStyle(
          districtStyle()
        );
      },

      click: () => {
        navigate(
          `/agriculture/district/${encodeURIComponent(
            districtName
          )}`
        );
      },
    });
  };

  if (loading) {
    return (
      <div
        style={{
          background: "#FCFAF5",
          borderRadius: "20px",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1F4F39",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        Loading Telangana Agriculture Map...
      </div>
    );
  }

  if (!districts) {
    return (
      <div
        style={{
          background: "#FCFAF5",
          borderRadius: "20px",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8B1E1E",
          fontSize: "18px",
        }}
      >
        Unable to load Telangana map.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#FCFAF5",
        border: "1px solid #D5E3D4",
        borderRadius: "20px",
        padding: "25px",
        boxShadow:
          "0 6px 18px rgba(31,79,57,0.08)",
        marginBottom: "35px",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1F4F39",
            fontSize: "27px",
          }}
        >
          🗺️ Telangana Agriculture Map
        </h2>

        <p
          style={{
            margin:
              "8px 0 0",
            color: "#4E8F68",
            fontSize: "15px",
          }}
        >
          Click a district to explore
          its agriculture data
        </p>
      </div>

      <div
        style={{
          height: "600px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border:
            "1px solid #D5E3D4",
        }}
      >
        <MapContainer
          center={[
            17.9,
            79.2,
          ]}
          zoom={7}
          scrollWheelZoom={true}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <GeoJSON
            data={districts}
            style={districtStyle}
            onEachFeature={
              onEachDistrict
            }
          />

          <MapFitBounds
            geojson={districts}
          />
        </MapContainer>
      </div>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#4E8F68",
          fontSize: "14px",
        }}
      >
        <span
          style={{
            width: "18px",
            height: "18px",
            background: "#9FC7A5",
            border:
              "1px solid #1F4F39",
            borderRadius: "4px",
          }}
        />

        <span>
          Click any district for
          detailed agriculture
          analytics
        </span>
      </div>
    </div>
  );
}
