import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

function FitMap() {
  const map = useMap();

  useEffect(() => {
    map.setView([17.85, 79.25], 7.1);

    map.setMinZoom(7.1);
    map.setMaxZoom(7.1);

    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
  }, [map]);

  return null;
}

export default function TelanganaMap() {

  const navigate = useNavigate();

  const geoRef = useRef(null);

  const [geoData, setGeoData] = useState(null);

  /* ---------------- Load Telangana GeoJSON ---------------- */

  useEffect(() => {

    fetch("/telangana-districts.geojson")
      .then((res) => res.json())
      .then((data) => {

        console.log("GeoJSON Loaded");

        setGeoData(data);

      })
      .catch((err) =>
        console.error("GeoJSON Error:", err)
      );

  }, []);

  /* ---------------- District Style ---------------- */

  const styleFeature = () => ({

    fillColor: "#BC90D6",

    fillOpacity: 0.92,

    color: "#FFFFFF",

    weight: 1.2,

  });

  /* ---------------- District Events ---------------- */
  /* ---------------- District Events ---------------- */

const onEachFeature = (feature, layer) => {

  const districtName = feature.properties.shapeName;

  layer.bindTooltip(

    `
      <div
        style="
          font-family:Segoe UI;
          background:#FFFFFF;
          padding:10px 14px;
          border-radius:12px;
          color:#9443CC;
          font-size:15px;
          font-weight:600;
          text-align:center;
          box-shadow:0 4px 12px rgba(0,0,0,.12);
        "
      >
        📍 ${districtName}
      </div>
    `,

    {
      sticky: true,
      direction: "top",
      opacity: 1,
    }

  );

  layer.on({

    mouseover(e) {

      const current = e.target;

      current.setStyle({

        fillColor: "#9443CC",
        fillOpacity: 1,
        color: "#FFFFFF",
        weight: 2,

      });

      current.bringToFront();

    },

    mouseout(e) {

      geoRef.current.resetStyle(e.target);

    },

    click() {

      navigate(
        `/district-analysis/${encodeURIComponent(districtName)}`
      );

    },

  });

};
return (

  <div
    style={{
      height: "650px",
      borderRadius: "24px",
      overflow: "hidden",
      position: "relative",
      background:
        "linear-gradient(135deg,#FFF9FC,#FCF5FF,#F8F2FF)",
      border: "1px solid #F2E6FA",
      boxShadow: "0 12px 28px rgba(169,102,209,.12)",
    }}
  >

    <MapContainer
      center={[17.85, 79.25]}
      zoom={7.1}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      style={{
        height: "100%",
        width: "100%",
        background: "#FCFAFF",
      }}
    >

      <FitMap />

      {geoData && (

        <GeoJSON
          ref={geoRef}
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />

      )}

    </MapContainer>

  </div>

);

}