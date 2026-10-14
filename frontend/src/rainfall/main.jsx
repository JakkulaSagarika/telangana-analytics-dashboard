import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";
import { RainfallProvider } from "./context/RainfallContext";

createRoot(document.getElementById("root")).render(
    <RainfallProvider>
        <App />
    </RainfallProvider>
);