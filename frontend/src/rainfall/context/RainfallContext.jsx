import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/apiClient";


const RainfallContext = createContext();

export function RainfallProvider({ children }) {
    const fallbackYear = 2022;

    const [selectedYear, setSelectedYear] = useState(fallbackYear);
    const [availableYears, setAvailableYears] = useState([fallbackYear]);
    const [loadingYears, setLoadingYears] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadYears = async () => {
            setLoadingYears(true);

            for (let attempt = 0; attempt < 3; attempt += 1) {
                try {
                    const response = await apiClient.get("/years/");
                    const years = response.data.years || [fallbackYear];

                    if (!cancelled) {
                        setAvailableYears(years);
                        setSelectedYear(response.data.latest_year || years.at(-1) || fallbackYear);
                        setLoadingYears(false);
                    }
                    return;
                } catch (error) {
                    if (attempt === 2) {
                        console.error("Available years error:", error);
                        if (!cancelled) {
                            setAvailableYears((current) => current.length ? current : [fallbackYear]);
                            setSelectedYear((current) => current || fallbackYear);
                            setLoadingYears(false);
                        }
                        return;
                    }

                    await new Promise(resolve => {
                        setTimeout(resolve, 300 * (attempt + 1));
                    });
                }
            }
        };

        loadYears();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <RainfallContext.Provider
            value={{
                selectedYear,
                setSelectedYear,
                availableYears,
                loadingYears,
            }}
        >
            {children}
        </RainfallContext.Provider>
    );
}

export function useRainfall() {
    return useContext(RainfallContext);
}