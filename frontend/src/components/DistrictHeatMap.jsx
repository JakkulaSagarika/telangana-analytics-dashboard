import { useEffect, useRef, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

const DistrictHeatMap = () => {

    const navigate = useNavigate();

    const geoRef = useRef();

    const [geoData, setGeoData] = useState(null);

    const [stats, setStats] = useState({});

    useEffect(() => {

        fetch("/telangana-districts.geojson")
            .then((res) => res.json())
            .then(setGeoData);

    }, []);

    useEffect(() => {

        loadHeatmap();

    }, []);

    const loadHeatmap = async () => {

        try {

            const res = await API.get("analytics-heatmap/");

            const obj = {};

            res.data.forEach((item) => {

                obj[item.district_name.trim().toLowerCase()] = item;

            });

            setStats(obj);

        } catch (err) {

            console.error(err);

        }

    };

    const getColor = (patients) => {

        if (patients > 1000) return "#EF4444";

        if (patients > 600) return "#FB923C";

        if (patients > 300) return "#FDE68A";

        if (patients > 100) return "#BBF7D0";

        if (patients > 0) return "#DCFCE7";

        return "#E5E7EB";

    };

    useEffect(() => {

        if (!geoRef.current) return;

        geoRef.current.eachLayer((layer) => {

            const district = layer.feature.properties.shapeName
                .trim()
                .toLowerCase();

            const s = stats[district] || {};

            layer.setStyle({

                fillColor: getColor(s.patients || 0),

                fillOpacity: 0.9,

                color: "#FFFFFF",

                weight: 1.5,

            });

            layer.unbindTooltip();

            layer.bindTooltip(

                `
                <div style="font-family:Segoe UI;padding:10px">

                    <h4 style="margin:0 0 8px;color:#7C3AED;">
                        📍 ${layer.feature.properties.shapeName}
                    </h4>

                    👥 <b>Patients:</b> ${s.patients || 0}<br/>

                    👨 <b>Male:</b> ${s.male || 0}<br/>

                    👩 <b>Female:</b> ${s.female || 0}<br/>

                    🎂 <b>Average Age:</b>
                    ${Number(s.average_age || 0).toFixed(1)}<br/>

                    🏥 <b>Facilities:</b>
                    ${s.facilities || 0}

                </div>
                `,
                {
                    direction: "auto",
                    sticky: false,
                    opacity: 0.95,
                }

            );

        });

    }, [stats]);
        const onEachFeature = (feature, layer) => {

        const districtName = feature.properties.shapeName;

        const district = districtName
            .trim()
            .toLowerCase();

        layer.on({

            mouseover(e) {

                const s = stats[district] || {};

                e.target.setStyle({

                    fillColor: "#A855F7",

                    fillOpacity: 1,

                    color: "#FFFFFF",

                    weight: 2,

                });

                e.target.bringToFront();

            },

            mouseout(e) {

                const s = stats[district] || {};

                e.target.setStyle({

                    fillColor: getColor(s.patients || 0),

                    fillOpacity: 0.9,

                    color: "#FFFFFF",

                    weight: 1.5,

                });

            },

            click() {

                navigate(
                    `/district-analysis/${encodeURIComponent(
                        districtName
                    )}`
                );

            },

        });

    };

    return (

        <div
            style={{
                position: "relative",
                height: "650px",
                borderRadius: "24px",
                overflow: "hidden",
                background: "rgba(255,255,255,.35)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,.45)",
            }}
        >

            <MapContainer
                center={[17.85, 79.25]}
                zoom={6.2}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                boxZoom={false}
                keyboard={false}
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#FFF8F4",
                }}
            >

                <FitMap />

                {geoData && (

                    <GeoJSON
                        ref={geoRef}
                        data={geoData}
                        onEachFeature={onEachFeature}
                    />

                )}

            </MapContainer>

            <div
                style={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    background: "rgba(255,255,255,.95)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "16px",
                    padding: "14px 18px",
                    boxShadow: "0 8px 20px rgba(0,0,0,.12)",
                    fontSize: "13px",
                    zIndex: 1000,
                }}
            >

                <div
                    style={{
                        fontWeight: 700,
                        color: "#4C1D95",
                        marginBottom: "10px",
                    }}
                >
                    Patient Heatmap
                </div>

                <div><span style={{color:"#EF4444"}}>■</span> &gt; 1000 Patients</div>
                <div><span style={{color:"#FB923C"}}>■</span> 601 - 1000 Patients</div>
                <div><span style={{color:"#FDE68A"}}>■</span> 301 - 600 Patients</div>
                <div><span style={{color:"#BBF7D0"}}>■</span> 101 - 300 Patients</div>
                <div><span style={{color:"#DCFCE7"}}>■</span> 1 - 100 Patients</div>
                <div><span style={{color:"#E5E7EB"}}>■</span> No Data</div>

            </div>

        </div>

    );

};

export default DistrictHeatMap;