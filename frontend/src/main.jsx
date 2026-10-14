import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// Leaflet CSS
import "leaflet/dist/leaflet.css";

// Global Styles
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);