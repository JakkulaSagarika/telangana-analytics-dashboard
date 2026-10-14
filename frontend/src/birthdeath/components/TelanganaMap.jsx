import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

import secretariat from "../assets/images/secretariat.png";
import charminar from "../assets/images/charminar.png";
import budha from "../assets/images/budha.png";
import thoranam from "../assets/images/thoranam.png";
import ramappa from "../assets/images/ramappa.png";
import golkonda from "../assets/images/golkonda.png";
import bogatha from "../assets/images/bogatha.png";

function FitToTelangana({ geoData }) {
  const map = useMap();

  useEffect(() => {
    if (!geoData) return;

    const layer = L.geoJSON(geoData);

    // Fit tightly to Telangana
    map.fitBounds(layer.getBounds(), {
      padding: [5, 5],
      animate: true,
    });

    // Zoom in one extra level
    setTimeout(() => {
      map.zoomIn(0.45);
    }, 100);

  }, [geoData, map]);

  return null;
} 

function TelanganaMap({ setSelectedDistrict }) {

  const [geoData, setGeoData] = useState(null);

  const [selectedLayer, setSelectedLayer] = useState(null);

  const geoJsonRef = useRef(null);

  const images = [
    secretariat,
    charminar,
    budha,
    thoranam,
    ramappa,
    golkonda,
    bogatha,
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {

    // The shared map asset is served from the single React app's public root.
    // The previous /maps path did not exist in the unified build, so no
    // GeoJSON layer was ever rendered.
    fetch("/telangana-districts.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`Unable to load Telangana map: ${res.status}`);
        return res.json();
      })
      .then((data) => setGeoData(data))
      .catch((err) => console.error(err));

  }, []);

  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentImage((prev) => (prev + 1) % images.length);

    }, 5000);

    return () => clearInterval(timer);

  }, []);

  const defaultStyle = {

    color: "#FFFFFF",

    weight: 2.3,

    fillColor: "#C084FC",

    fillOpacity: 0.68,

  };

  const hoverStyle = {

    color: "#FFFFFF",

    weight: 3.5,

    fillColor: "#8B5CF6",

    fillOpacity: 0.90,

  };

  const selectedStyle = {

    color: "#FFFFFF",

    weight: 4,

    fillColor: "#5B21B6",

    fillOpacity: 1,

  };

  const onEachDistrict = (feature, layer) => {

    const district =
      feature.properties.shapeName ||
      feature.properties.DISTRICT ||
      feature.properties.district;

    layer.bindTooltip(

      `
      <div style="
          padding:8px 12px;
          font-size:13px;
          font-weight:700;
          color:#4338CA;
      ">
        ${district}
      </div>
      `,

      {
        sticky: true,
        direction: "top",
      }

    );

    layer.on({

      mouseover: (e) => {

        if (selectedLayer !== e.target) {

          e.target.setStyle(hoverStyle);

        }

        e.target.bringToFront();

      },

      mouseout: (e) => {

        if (selectedLayer !== e.target) {

          e.target.setStyle(defaultStyle);

        }

      },

      click: (e) => {

        if (selectedLayer) {

          selectedLayer.setStyle(defaultStyle);

        }

        e.target.setStyle(selectedStyle);

        e.target.bringToFront();

        setSelectedLayer(e.target);

        if (setSelectedDistrict) {

          setSelectedDistrict(district);

        }

      },

    });

  };
    return (

    <div className="map-card">

      <div className="map-header">

        <h3>Telangana District Map</h3>

        <p>Select a district to view statistics</p>

      </div>

      <div className="map-wrapper">

        {/* Background Slideshow */}

        <div
          className="map-background"
          style={{
            backgroundImage: `url(${images[currentImage]})`,
          }}
        />

        {/* Soft Pink Overlay */}

        <div className="map-overlay" />

        <MapContainer

          zoom={7}

          scrollWheelZoom={false}

          dragging={false}

          doubleClickZoom={false}

          touchZoom={false}

          boxZoom={false}

          keyboard={false}

          zoomControl={false}

          attributionControl={false}

          style={{

            height: "760px",

            width: "100%",

            background: "transparent",

            borderRadius: "22px",

            zIndex: 2,

          }}

        >

          {geoData && <FitToTelangana geoData={geoData} />}

          {geoData && (

            <GeoJSON

              ref={geoJsonRef}

              data={geoData}

              style={defaultStyle}

              onEachFeature={onEachDistrict}

            />

          )}

        </MapContainer>

        {/* Slideshow Dots */}

        <div className="slideshow-dots">

          {images.map((_, index) => (

            <span

              key={index}

              className={

                index === currentImage

                  ? "dot active-dot"

                  : "dot"

              }

            />

          ))}

        </div>

      </div>

    </div>

  );

}

export default TelanganaMap;
