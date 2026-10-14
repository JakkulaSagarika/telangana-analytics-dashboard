import { MapContainer, GeoJSON, TileLayer, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function FitToBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    const layer = L.geoJSON(data);

    map.fitBounds(layer.getBounds(), {
      padding: [5, 5],
      maxZoom: 8,
    });
  }, [data, map]);

  return null;
}

function LiteracyMap({
  selectedDistrict,
  setSelectedDistrict,
  literacyData,
}) {
  const [districts, setDistricts] = useState(null);

  useEffect(() => {
    axios
      .get("/api/literacy/districts/")
      .then((res) => {
        console.log("District API:", res.data);
        setDistricts(res.data);
      })
      .catch(console.error);
  }, []);

  const districtMap = {
  "BHADRADRI KOTHAGUDEM": "BHADRADRI",
  "JAYASHANKAR BHUPALPALLY": "JAYASHANKAR",
  "JOGULAMBA GADWAL": "JOGULAMBA",
  "KOMARAM BHEEM ASIFABAD": "KOMARAM BHEEM",
  "MEDCHAL MALKAJGIRI": "MEDCHAL",
  "MEDCHAL-MALKAJGIRI": "MEDCHAL",
  "RAJANNA SIRCILLA": "RAJANNA",
  "YADADRI BHUVANAGIRI": "YADADRI",
  "YADADRI-BHUVANAGIRI": "YADADRI",
  "WARANGAL RURAL": "WARANGAL (R)",
  "WARANGAL URBAN": "WARANGAL (U)",
  "HANUMAKONDA": "WARANGAL (U)"
};

function normalize(name) {
  return name
    .toUpperCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
 function getLiteracyRate(district) {
  if (!literacyData || !district) return null;

  const lookupDistrict =
    districtMap[normalize(district)] || district;

  console.log("GeoJSON:", district);
  console.log("Lookup:", lookupDistrict);

  const row = literacyData.find(
    (d) => normalize(d.Districts) === normalize(lookupDistrict)
  );

  console.log("Matched Row:", row);

  if (!row) return null;

  return (
    (Number(row["Literacy Rate Males"]) +
      Number(row["Literacy Rate Females"])) / 2
  );
}

function getColor(rate) {
  if (rate === null) return "#E5E7EB";

  if (rate >= 80) return "#065F46"; // Dark Teal
  if (rate >= 75) return "#0F766E"; // Teal
  if (rate >= 70) return "#14B8A6"; // Medium Teal
  if (rate >= 65) return "#5EEAD4"; // Light Teal

  return "#CCFBF1"; // Very Light Teal
}

  // Style each district
  function style(feature) {
  const district =
    feature.properties.DISTRICT_N ||
    feature.properties.DISTRICT;
    console.log("District:", district);

  const rate = getLiteracyRate(district);

  const isSelected = selectedDistrict === district;

  return {
    fillColor: isSelected ? "#F59E0B" : getColor(rate),
    weight: isSelected ? 4 : 2,
    color: "#ffffff",
    opacity: 1,
    fillOpacity: 0.9,
  };
}

  function onEachFeature(feature, layer) {
    const district =
      feature.properties.DISTRICT_N ||
      feature.properties.DISTRICT;

    const rate = getLiteracyRate(district);

layer.bindTooltip(
  `
  <b>${district}</b><br/>
  Literacy: ${rate ? rate.toFixed(2) : "N/A"}%
  `,
  {
    permanent: false,
    direction: "top",
    className: "district-label",
    sticky: true,
  }
);

    layer.on({
      mouseover(e) {
        e.target.setStyle({
          weight: 4,
          fillColor: "#14B8A6",
          fillOpacity: 1,
        });

        e.target.bringToFront();
      },

      mouseout(e) {
        e.target.setStyle(style(feature));
      },

      click() {
        setSelectedDistrict(district);
      },
    });
  }

  return (
    <MapContainer
      center={[17.5, 79.2]}
      zoom={8}
      minZoom={7}
      maxZoom={12}
      style={{
        height: "650px",
        width: "100%",
        background: "#ffffff",
        borderRadius: "15px",
      }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {districts && <FitToBounds data={districts} />}

      {districts && (
        <GeoJSON
          key={selectedDistrict}
          data={districts}
          style={style}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
}

export default LiteracyMap;
