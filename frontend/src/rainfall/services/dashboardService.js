import apiClient from "../api/apiClient";


/* ============================================================
   DISTRICTS
============================================================ */

export const getDistricts = async (year) => {

    const response = await apiClient.get(
        "/districts/",
        {
            params: { year },
        }
    );

    return response.data;
};


/* ============================================================
   MANDALS
============================================================ */

export const getMandals = async (year, district) => {

    const response = await apiClient.get(
        "/mandals/",
        {
            params: { year, district },
        }
    );

    return response.data;
};


/* ============================================================
   DAILY RAINFALL
============================================================ */

export const getDailyRainfall = async (
    date,
    year,
    signal
) => {

    const response = await apiClient.get(
        `/daily/${date}/`,
        {
            params: { year },
            signal,
        }
    );

    return response.data;
};


/* ============================================================
   YEARLY RAINFALL CALENDAR
============================================================ */

export const getRainfallCalendar = async (
    year
) => {

    const response = await apiClient.get(
        "/calendar/",
        {
            params: { year },
        }
    );

    return response.data;
};

export const getDistrictAnalysis = async (district, year) => {
    const response = await apiClient.get(
        `/district/${encodeURIComponent(district)}/`,
        { params: { year } }
    );

    return response.data;
};

export const getMandalAnalysis = async (district, mandal, year) => {
    const response = await apiClient.get(
        `/mandal/${encodeURIComponent(district)}/${encodeURIComponent(mandal)}/`,
        { params: { year } }
    );

    return response.data;
};

export const getRainfallTrends = async (year) => {
    const response = await apiClient.get(
        "/trends/",
        { params: { year } }
    );

    return response.data;
};

export const getHumidityAnalysis = async (year) => {
    const response = await apiClient.get(
        "/humidity/analysis/",
        { params: { year } }
    );

    return response.data;
};